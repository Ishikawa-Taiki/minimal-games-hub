import re
from playwright.sync_api import sync_playwright, Page, expect

def verify_dots_and_boxes(page: Page):
    """
    ドット＆ボックスゲームのレイアウトとヒント機能のE2Eテスト
    """
    # 1. ゲームページに移動
    page.goto("http://localhost:3000/games/dots-and-boxes")

    # 2. 難易度「かんたん」を選択
    page.get_by_role("button", name="かんたん").click()

    # 3. 「おしえて！」ボタンをオンにする
    hint_button = page.get_by_role("button", name="おしえて！")
    hint_button.click()
    expect(hint_button).to_have_attribute("aria-pressed", "true")

    # 4. 最初の水平線をクリックしてプレビューを表示
    # ラインはdata-testidで識別する
    page.locator('[data-testid="h-line-0-0"]').click()

    # 5. プレビューが表示されていることを確認
    # プレビューでは、ボックスの背景色と残りのライン数が変化する
    # ここでは、特定のボックスのスタイルとテキストを確認する
    # 例：(0,0)のボックスがプレビュー状態になる
    box = page.locator('[data-testid="box-0-0"]')
    expect(box).to_have_attribute("data-preview", "true")

    # 残りライン数のプレビューを確認
    remaining_lines = box.locator('[data-testid="remaining-lines-0-0"]')
    # プレビューによってライン数が 4 -> 3 に変わることを期待
    expect(remaining_lines).to_have_text("3")


    # 6. スクリーンショットを撮影
    page.screenshot(path="jules-scratch/verification/verification.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        verify_dots_and_boxes(page)
        browser.close()

if __name__ == "__main__":
    main()