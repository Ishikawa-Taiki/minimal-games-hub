import time
from playwright.sync_api import sync_playwright, Page, expect

def run_verification(page: Page):
    """
    Verifies the functionality of the Dots and Boxes game.
    - Checks initial layout and hint feature.
    - Checks preview functionality.
    - Checks move confirmation.
    """
    print("Navigating to the Dots and Boxes game page...")
    page.goto("http://localhost:3000/games/dots-and-boxes", timeout=60000)

    # 1. Start game
    print("Starting a new game with 'easy' difficulty...")
    page.get_by_role("button", name="かんたん").click()

    # Wait for the board to be visible
    expect(page.get_by_test_id("game-board")).to_be_visible(timeout=10000)
    print("Game board is visible.")

    # 2. Enable hints and verify initial hint display
    print("Enabling hints...")
    # The hint toggle is part of the common GameLayout, assuming it's a switch role.
    hint_toggle = page.get_by_role("switch", name="おしえて！")
    expect(hint_toggle).to_be_visible()
    hint_toggle.check()
    expect(hint_toggle).to_be_checked()
    print("Hints enabled.")

    print("Taking screenshot of the initial board with hints...")
    page.screenshot(path="jules-scratch/verification/01_initial_board_with_hints.png")

    # Verify that all boxes show the number '4'
    box_count = len(page.get_by_text("4").all())
    expect(box_count).to_be(4)
    print("Verified that all 4 boxes show the hint '4'.")

    # 3. Verify preview functionality
    print("Clicking a line to activate preview...")
    # Click the top-left horizontal line
    page.get_by_test_id("h-line-0-0").click()

    time.sleep(0.5) # Wait for preview to render

    print("Taking screenshot of the preview state...")
    page.screenshot(path="jules-scratch/verification/02_preview_state.png")

    # 4. Confirm the move
    print("Clicking the same line again to confirm the move...")
    page.get_by_test_id("h-line-0-0").click()

    time.sleep(0.5) # Wait for move to be processed

    print("Taking screenshot of the board after one move...")
    page.screenshot(path="jules-scratch/verification/03_after_first_move.png")

    # Verify the line is now owned and the hint count is updated
    line_style = page.get_by_test_id("h-line-0-0").evaluate("element => getComputedStyle(element).backgroundColor")
    expect(line_style).to_be("rgb(239, 68, 68)") # player1 color

    # Verify the hint for the top-left box is now '3'
    expect(page.get_by_text("3")).to_be_visible()
    print("Verified line is drawn and hint is updated.")

    print("Verification script finished successfully.")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            run_verification(page)
        except Exception as e:
            print(f"An error occurred: {e}")
            page.screenshot(path="jules-scratch/verification/error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    main()