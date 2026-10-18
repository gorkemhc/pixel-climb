# Test plan

## Automated checks

Run `node tests/smoke-test.js`. It checks local script/style references, JavaScript syntax, required UI controls and external project URLs, updated project-rail copy, background blur buffers, absence of the removed HUD tile and flag/checkpoint code, pause/resume music methods, zeroed new-run values, and versioned storage transactions including run settlement, purchase, duplicate purchase, insufficient funds, and equipping.

## Browser acceptance checklist

The smoke test also simulates full reset and checks that only the four known Pixel Climb storage keys are removed, saved audio settings reset, owned cosmetics and records clear, and unrelated site data remains.

1. Open `index.html` with a local server; confirm the splash gives way to the menu.
2. At a desktop viewport, confirm the 16:9 playfield is large and balanced; verify the natural background fills its width without castle silhouettes. Check that the backdrop is softly blurred while platforms, the character, and HUD remain sharp.
3. Start a run; move, jump, double jump, land, collect a coin, and inspect score/height/health feedback.
4. Pause from the HUD and from P/Escape; confirm music stops and its sequence position is retained, then resume and restart. Verify music remains off if its setting is disabled.
5. End a run; confirm saved records update, run coins are added only once, and retry starts with zero run score/coins.
6. Open the shop, switch categories, buy an affordable item, equip it, and confirm the balance and player appearance. Confirm unaffordable and duplicate purchases fail.
7. Toggle music and effects independently, adjust volumes, reload, and confirm settings persist.
8. Test portrait and landscape mobile sizes; check page overflow, shop/menu fit, touch pointer release/cancel, and control usability.
9. Enter and exit full screen; verify the game remains centered and undistorted.
10. Confirm project links point to their expected destinations and the project rail says “Diğer projelere göz at.” Verify LinkedIn has no fabricated URL until `LINKEDIN_URL` is set.
11. Inspect the browser console for runtime errors.
12. In Settings, open the full-reset confirmation and cancel; verify balance, owned items, records, settings, and shop state remain intact. Reopen, confirm, and verify the game returns to the menu with defaults; reload and verify the reset persists. Repeat a normal run restart and confirm saved progress remains.
13. Inspect the background across biomes to confirm there are no tree silhouettes; verify mountains, waterfalls, and clouds remain. Check that magnet, rocket, shield, coin, and shop item icons are recognizable at their rendered sizes.

The automated smoke test does not claim to cover every gameplay interaction. Browser checks must be performed in an actual browser session and reported separately.
