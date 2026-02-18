import argparse
import os
from playwright.sync_api import sync_playwright
from datetime import datetime

SCALES = [f'{i}x' for i in range(1, 16)]

BROWSER_SIZES = {
    'normal':   1,
    'medium':   3/4,
    'small':    0.5,
    'smallest': 1/3,
}

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'static', 'screenshots')

def main():
    parser = argparse.ArgumentParser(description='Take screenshots of Graph Lens Lite')
    parser.add_argument('--scale', default='1x', choices=SCALES,
                        help='Screenshot scale factor (default: 1x)')
    parser.add_argument('--portrait', action='store_true',
                        help='Use portrait orientation (1080x1920 instead of 1920x1080)')
    parser.add_argument('--browser-size', default='normal', choices=BROWSER_SIZES.keys(),
                        help='Browser window size (default: normal)')
    args = parser.parse_args()

    scale = int(args.scale[:-1])
    base = {'width': 1080, 'height': 1920} if args.portrait else {'width': 1920, 'height': 1080}
    vp = base
    res_w = vp['width'] * scale
    res_h = vp['height'] * scale

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with sync_playwright() as p:
        browser_scale = BROWSER_SIZES[args.browser_size]
        browser_vp = {
            'width': int(1920 * browser_scale),
            'height': int(1080 * browser_scale),
        }
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            viewport=browser_vp,
            device_scale_factor=scale,
        )
        page = context.new_page()
        page.goto('http://127.0.0.1:8000/graph_lens_lite.html')

        orientation = "portrait" if args.portrait else "landscape"
        print(f"\n=== Screenshot Tool ({args.scale} {orientation}: {res_w}x{res_h}) ===")
        print("Navigate in the browser window, then:")
        if args.portrait:
            print("On capture, viewport resizes to portrait, takes screenshot, then resizes back.")
        print("Press ENTER to take a screenshot")
        print("Type 'quit' to exit\n")

        while True:
            user_input = input("> ").strip().lower()
            if user_input == 'quit':
                break

            if args.portrait:
                page.set_viewport_size(vp)
                page.wait_for_timeout(500)

            filename = f"screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            filepath = os.path.join(OUTPUT_DIR, filename)
            page.screenshot(path=filepath, full_page=False)
            print(f"✓ Saved: {filepath} ({res_w}x{res_h})")

            if args.portrait:
                page.set_viewport_size(browser_vp)

        context.close()
        browser.close()

if __name__ == '__main__':
    main()
