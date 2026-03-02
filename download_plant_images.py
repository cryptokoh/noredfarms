#!/usr/bin/env python3
"""Download plant hero images from Lorem Flickr (Creative Commons)."""
import urllib.request
import os
import time

DEST = "/home/koh/Documents/pureextracts/images/plants"

# plant-id: search keywords for Lorem Flickr
PLANTS = {
    "ginger": "ginger,root",
    "kava": "kava,plant",
    "kratom": "kratom,leaves",
    "blue-lotus": "blue,lotus,flower",
    "egyptian-blue-lotus": "water,lily,blue",
    "moringa": "moringa,tree",
    "elderberry": "elderberry,berries",
    "passionflower": "passionflower,bloom",
    "lions-mane": "lions,mane,mushroom",
    "dragon-fruit": "dragon,fruit,pitaya",
    "pomegranate": "pomegranate,fruit",
    "prickly-pear": "prickly,pear,cactus",
    "dandelion": "dandelion,flower",
    "mullein": "mullein,plant",
    "yaupon-holly": "holly,leaves,green",
    "bacopa-monnieri": "bacopa,herb",
    "kanna": "succulent,plant",
    "san-pedro": "san,pedro,cactus",
    "absinthe-wormwood": "wormwood,artemisia",
    "russian-comfrey": "comfrey,flowers",
    "thai-mint": "mint,herb,green",
    "roselle-hibiscus": "hibiscus,red,flower",
    "high-cbd-hemp": "hemp,plant,field",
    "high-thc-cannabis": "cannabis,plant",
    "industrial-hemp": "hemp,field",
    "blue-java-banana": "banana,plant,tropical",
    "red-spanish-pineapple": "pineapple,tropical",
    "heirloom-sugarcane": "sugarcane,field",
    "heirloom-quinoa": "quinoa,plant",
    "deep-purple-carrot": "purple,carrot",
    "detroit-red-beet": "beet,red,garden",
    "purple-sweet-potato": "sweet,potato,purple",
    "jerusalem-artichoke": "jerusalem,artichoke",
    "redbor-kale": "kale,purple,leaves",
    "tropea-onion": "red,onion",
    "switchgrass": "prairie,grass",
    "little-bluestem": "bluestem,grass",
    "sideoats-grama": "grass,prairie",
    "subterranean-clover": "clover,green",
    "duckweed": "duckweed,aquatic",
    "davis-mountain-yucca": "yucca,desert",
    "texas-persimmon": "persimmon,fruit",
    "agarita": "berberis,shrub",
    "san-saba-pecan": "pecan,tree",
    "santa-rosa-plum": "plum,fruit,tree",
    "nemaguard-peach": "peach,fruit,tree",
    "hawaiian-baby-woodrose": "morning,glory,vine",
    "heavenly-blue-morning-glory": "morning,glory,blue",
}

os.makedirs(DEST, exist_ok=True)

downloaded = 0
skipped = 0
failed = 0

for plant_id, keywords in PLANTS.items():
    dest_file = os.path.join(DEST, f"{plant_id}.jpg")
    if os.path.exists(dest_file) and os.path.getsize(dest_file) > 5000:
        print(f"SKIP {plant_id} (already exists)")
        skipped += 1
        continue
    url = f"https://loremflickr.com/800/500/{keywords}"
    print(f"Downloading {plant_id}... ({keywords})")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
            if len(data) > 5000:
                with open(dest_file, "wb") as f:
                    f.write(data)
                print(f"  OK ({len(data)} bytes)")
                downloaded += 1
            else:
                print(f"  WARN: tiny response ({len(data)} bytes), skipping")
                failed += 1
    except Exception as e:
        print(f"  FAIL: {e}")
        failed += 1
    time.sleep(1.0)

print(f"\nSummary: {downloaded} downloaded, {skipped} skipped, {failed} failed")
print(f"Files in {DEST}:")
for f in sorted(os.listdir(DEST)):
    size = os.path.getsize(os.path.join(DEST, f))
    print(f"  {f} ({size:,} bytes)")
