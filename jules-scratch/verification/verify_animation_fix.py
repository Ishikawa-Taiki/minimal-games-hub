import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            await page.goto("http://localhost:3000/games/hasami-shogi", timeout=60000)

            # 1. Start the game
            await page.get_by_test_id("win-cond-standard").click()
            await expect(page.get_by_test_id("pre-game-screen")).to_be_hidden()

            await expect(page.get_by_test_id("game-state-display")).to_have_text("「歩」のばん")

            # 2. Move Player 1's piece
            await page.get_by_test_id("cell-8-0").click()
            await page.get_by_test_id("cell-1-0").click()

            # 3. Wait for Player 2's turn and for animation to finish
            await expect(page.get_by_test_id("game-state-display")).to_have_text("「と」のばん")
            await page.wait_for_timeout(500) # Wait for P1 animation to end and isAnimating to become false

            # 4. Move Player 2's piece
            await page.get_by_test_id("cell-0-8").click()
            await page.get_by_test_id("cell-7-8").click()

            # 5. Wait for turn to change back to Player 1
            await expect(page.get_by_test_id("game-state-display")).to_have_text("「歩」のばん")
            await page.wait_for_timeout(500) # Wait for P2 animation to end

            # 6. Assert that the score for player 2 is 0, which means no piece was captured
            score_p2 = page.get_by_test_id("score-value-PLAYER1") # Player1's pieces captured by Player2
            await expect(score_p2).to_contain_text("とったかず: 0")

            # 7. Take a screenshot for visual confirmation
            await page.screenshot(path="jules-scratch/verification/verification.png")

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())