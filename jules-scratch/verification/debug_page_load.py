from playwright.sync_api import sync_playwright, Page

def run_debug(page: Page):
    """
    Navigates to the dots-and-boxes game page and takes a screenshot
    to debug the initial page rendering.
    """
    print("Navigating to http://localhost:3000/games/dots-and-boxes for debugging...")
    page.goto("http://localhost:3000/games/dots-and-boxes", timeout=60000)
    print("Page loaded. Taking screenshot...")
    page.screenshot(path="jules-scratch/verification/debug_initial_load.png")
    print("Debug screenshot saved to jules-scratch/verification/debug_initial_load.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run_debug(page)
        except Exception as e:
            print(f"An error occurred during debugging: {e}")
            page.screenshot(path="jules-scratch/verification/debug_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    main()