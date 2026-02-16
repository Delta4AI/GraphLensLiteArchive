import argparse
import os
from playwright.sync_api import sync_playwright
from datetime import datetime

PRESETS = {
    'normal': {'viewport': {'width': 1920, 'height': 1080}, 'scale': 1},
    'hq':     {'viewport': {'width': 1920, 'height': 1080}, 'scale': 3},
    'ultrahq':{'viewport': {'width': 1920, 'height': 1080}, 'scale': 4},
}

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'static', 'screenshots')

def main():
    parser = argparse.ArgumentParser(description='Take screenshots of Graph Lens Lite')
    parser.add_argument('quality', nargs='?', default='hq', choices=PRESETS.keys(),
                        help='Screenshot quality preset (default: hq)')
    args = parser.parse_args()

    preset = PRESETS[args.quality]
    vp = preset['viewport']
    scale = preset['scale']
    res_w = vp['width'] * scale
    res_h = vp['height'] * scale

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport=vp, device_scale_factor=scale)
        page = context.new_page()
        page.goto('http://127.0.0.1:8000/graph_lens_lite.html')

        print(f"\n=== Screenshot Tool ({args.quality}: {res_w}x{res_h}) ===")
        print("Navigate in the browser window, then:")
        print("Press ENTER to take a screenshot")
        print("Type 'quit' to exit\n")

        while True:
            user_input = input("> ").strip().lower()
            if user_input == 'quit':
                break

            filename = f"screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            filepath = os.path.join(OUTPUT_DIR, filename)
            page.screenshot(path=filepath, full_page=False)
            print(f"✓ Saved: {filepath} ({res_w}x{res_h})")

        context.close()
        browser.close()

if __name__ == '__main__':
    main()
