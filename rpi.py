import requests
import time
import threading
import queue
import RPi.GPIO as GPIO
import tkinter as tk

# === CONFIG ===
SERVER_URL = "http://192.168.1.10:5000"  
s0, s1, s2, s3 = 5, 6, 12, 13
en = 16


GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup([s0, s1, s2, s3, en], GPIO.OUT)
GPIO.output(en, GPIO.HIGH)  # disable by default (HIGH)

input_queue = queue.Queue()


def select_channel(ch):
    GPIO.output(s0, ch & 0x01)
    GPIO.output(s1, (ch >> 1) & 0x01)
    GPIO.output(s2, (ch >> 2) & 0x01)
    GPIO.output(s3, (ch >> 3) & 0x01)

def activate_channel(channel_num):
    if not (1 <= channel_num <= 16):
        raise ValueError("Invalid channel number")

    select_channel(channel_num - 1)

    time.sleep(0.0001)

    GPIO.output(en, GPIO.LOW)

    time.sleep(3)

    GPIO.output(en, GPIO.HIGH)

def send_text_input(user_input):
    try:
        requests.post(f"{SERVER_URL}/api/locker/text-input", json={"textInput": user_input}, timeout=5)
        return True
    except Exception as e:
        return {"error": str(e)}

def get_locker_response():
    try:
        res = requests.get(f"{SERVER_URL}/api/locker/locker-number", timeout=5)
    
        return res.json()
    except Exception:
        return {}

def check_balance_request(user_input):
    try:
        res = requests.post(f"{SERVER_URL}/api/locker/check-balance", json={"textInput": user_input}, timeout=5)
        return res.json()
    except Exception:
        return {"error": "server_error"}


class MainPage(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent, bg="red")
        self.controller = controller

        tk.Button(
            self, text="Go to Check Balance",
            command=lambda: controller.show_frame("CheckBalancePage"),
            bg="white", fg="red"
        ).pack(anchor="ne", padx=10, pady=10)

        tk.Label(self, text="TUPC HELMET LOCKER SYSTEM",
                 font=("Arial Black", 24, "bold"), bg="red", fg="white").pack(pady=10)

        tk.Label(self, text="Scan your QR Code here to open locker",
                 font=("Arial", 16), bg="red", fg="white").pack(pady=5)

        self.entry = tk.Entry(self, width=40, font=("Arial", 16), justify="center")
        self.entry.pack(pady=15, ipady=8)
        self.entry.bind("<Return>", self.on_enter)
        self.entry.focus_set()

        self.response_label = tk.Label(self, text="", font=("Arial", 16, "bold"),
                                       bg="red", fg="white", wraplength=600, justify="center")
        self.response_label.pack(pady=20)

    def log_message(self, msg):
        self.response_label.config(text=msg)
        self.after(2000, lambda: self.response_label.config(text=""))

    def on_enter(self, event=None):
        text = self.entry.get().strip()
        if text:
            input_queue.put(text)
            self.entry.delete(0, tk.END)
            self.entry.focus_set()

class CheckBalancePage(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent, bg="red")
        self.controller = controller

        tk.Button(
            self, text="Back to Locker Page",
            command=lambda: controller.show_frame("MainPage"),
            bg="white", fg="red"
        ).pack(anchor="ne", padx=10, pady=10)

        tk.Label(self, text="CHECK BALANCE",
                 font=("Arial Black", 24, "bold"), bg="red", fg="white").pack(pady=10)

        tk.Label(self, text="Scan your QR Code here to check balance",
                 font=("Arial", 16), bg="red", fg="white").pack(pady=5)

        self.entry = tk.Entry(self, width=40, font=("Arial", 16), justify="center")
        self.entry.pack(pady=15, ipady=8)
        self.entry.bind("<Return>", self.on_enter)
        self.entry.focus_set()

        self.response_label = tk.Label(self, text="", font=("Arial", 16, "bold"),
                                       bg="red", fg="white", wraplength=600, justify="center")
        self.response_label.pack(pady=20)

    def log_message(self, msg):
        self.response_label.config(text=msg)
        self.after(2000, lambda: self.response_label.config(text=""))

    def on_enter(self, event=None):
        text = self.entry.get().strip()
        if text:

            threading.Thread(target=self._do_check_balance, args=(text,), daemon=True).start()
            self.entry.delete(0, tk.END)
            self.entry.focus_set()

    def _do_check_balance(self, text):
        data = check_balance_request(text)
        if "balanceRem" in data:
            self.after(0, lambda: self.log_message(f"✅ Balance remaining: {data['balanceRem']}"))
        elif data.get("message") == "record_unavailable":
            self.after(0, lambda: self.log_message("Record unavailable"))
        elif data.get("error") == "no_input_provided":
            self.after(0, lambda: self.log_message("Error: No input provided"))
        elif data.get("error") == "invalid_format":
            self.after(0, lambda: self.log_message("Error: Invalid ID format"))
        elif data.get("error") == "server_error":
            self.after(0, lambda: self.log_message("Error: Server error"))
        else:
            self.after(0, lambda: self.log_message("Unknown response"))

class LockerApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("TUPC Helmet Locker System")
        self.geometry("700x500")
        self.configure(bg="red")

        self.frames = {}
        for PageClass in (MainPage, CheckBalancePage):
            page_name = PageClass.__name__
            frame = PageClass(parent=self, controller=self)
            self.frames[page_name] = frame
            frame.place(relx=0.5, rely=0.5, anchor="center", relwidth=1, relheight=1)

        self.active_frame = self.frames["MainPage"]
        self.show_frame("MainPage")


        self._running = True

        threading.Thread(target=self.poll_locker_response, daemon=True).start()
        threading.Thread(target=self.input_worker, daemon=True).start()

        self.protocol("WM_DELETE_WINDOW", self.on_closing)

    def show_frame(self, page_name):
        frame = self.frames[page_name]
        self.active_frame = frame
        frame.tkraise()

        try:
            frame.entry.focus_set()
        except Exception:
            pass

    def schedule_log(self, page, msg):
        """Thread-safe log: schedule page.log_message on main thread."""
        page.after(0, lambda: page.log_message(msg))

    def poll_locker_response(self):
        while self._running:
            try:
                response = get_locker_response()

                if response and response.get("lockerToOpen") is not None:
                    try:
                        locker_id = int(response["lockerToOpen"])
                    except Exception:
                        self.schedule_log(self.active_frame, "❌ Error: Invalid locker number from server")
                        time.sleep(3)
                        continue

                    try:
                        activate_channel(locker_id)
                        msg = f"✅ Locker Assigned: {locker_id} | Remaining Balance: {response.get('balanceRem', 'N/A')}"

                        self.schedule_log(self.active_frame, msg)
                    except Exception as e:
                        self.schedule_log(self.active_frame, f"❌ GPIO Error: {e}")

                elif response and "error" in response:
                    err_type = response["error"]
                    balance_rem = response.get("balanceRem", "N/A")
                    if err_type == "unregistered_user":
                        self.schedule_log(self.active_frame, "❌ Error: Unregistered User")
                    elif err_type == "insufficient_balance":
                        self.schedule_log(self.active_frame, f"❌ Error: Insufficient Balance | Remaining Balance: {balance_rem}")
                    elif err_type == "no_available_slot":
                        self.schedule_log(self.active_frame, f"❌ Error: No Available Slot | Remaining Balance: {balance_rem}")
                    elif err_type == "invalid_format":
                        self.schedule_log(self.active_frame, "❌ Error: Invalid ID format")
                    elif err_type == "server_error":
                        self.schedule_log(self.active_frame, "❌ Error: Server Error")
                    else:
                        self.schedule_log(self.active_frame, f"❌ Error: {err_type}")


            except Exception as e:
                self.schedule_log(self.frames["MainPage"], f"Polling Error: {e}")

            for _ in range(30):  
                if not self._running:
                    break
                time.sleep(0.1)

    def input_worker(self):
        while self._running:
            try:
                if not input_queue.empty():
                    user_input = input_queue.get()
                    # POST the text input
                    result = send_text_input(user_input)
                    if isinstance(result, dict) and result.get("error"):
                        self.schedule_log(self.active_frame, f"❌ Error sending input: {result['error']}")
                    else:
                        self.schedule_log(self.active_frame, f"📨 Sent ID: {user_input}, waiting for locker assignment...")
                else:
                    time.sleep(0.1)
            except Exception as e:
                self.schedule_log(self.frames["MainPage"], f"Input Worker Error: {e}")

    def on_closing(self):
        self._running = False
        time.sleep(0.2)
        try:
            GPIO.output(en, GPIO.HIGH)
            GPIO.cleanup()
        except Exception:
            pass
        self.destroy()

if __name__ == "__main__":
    app = LockerApp()
    app.mainloop()
