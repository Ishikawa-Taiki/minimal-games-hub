from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Listen for console events and print them
        page.on("console", lambda msg: print(f"Browser console: {msg.text()}"))

        page.goto("http://localhost:3000/games/hasami-shogi")
        page.wait_for_selector('[data-testid="board"]', timeout=60000)
        page.screenshot(path="jules-scratch/verification/hasami-shogi.png")
        browser.close()

run()
