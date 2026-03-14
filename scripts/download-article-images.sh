#!/bin/bash
# Download article images from Wikimedia Commons
# Uses the Wikimedia API to search for CC-licensed plant photos

IMAGES_DIR="$(cd "$(dirname "$0")/.." && pwd)/images/articles"
mkdir -p "$IMAGES_DIR"
UA="NoredFarmsBot/1.0 (noredfarms.netlify.app)"

ok=0
fail=0
skip=0

download_image() {
  local slug="$1"
  local search="$2"
  local output="$IMAGES_DIR/${slug}.jpg"

  if [ -f "$output" ]; then
    echo "  SKIP: $slug"
    ((skip++))
    return
  fi

  # URL-encode the search term
  local encoded
  encoded=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$search'))")

  # Query Wikimedia Commons API
  local tmp="/tmp/wiki_${slug}.json"
  curl -s -A "$UA" -o "$tmp" \
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encoded}&gsrlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json"

  local thumb_url
  thumb_url=$(jq -r '.query.pages // {} | to_entries[0].value.imageinfo[0].thumburl // empty' "$tmp" 2>/dev/null)

  if [ -z "$thumb_url" ]; then
    echo "  MISS: $slug — '$search'"
    ((fail++))
    rm -f "$tmp"
    return
  fi

  # Download
  curl -s -A "$UA" -o "$output" "$thumb_url"

  if [ -s "$output" ]; then
    local size
    size=$(du -h "$output" | cut -f1)
    echo "  OK:   $slug ($size)"
    ((ok++))
  else
    rm -f "$output"
    echo "  FAIL: $slug — download error"
    ((fail++))
  fi
  rm -f "$tmp"
}

echo "=== Downloading article images from Wikimedia Commons ==="
echo ""

# Blue Lotus (3)
download_image "blue-lotus-compounds" "Nymphaea caerulea flower"
download_image "blue-lotus-ancient-egypt" "Egyptian blue lotus Nymphaea painting"
download_image "egyptian-blue-lotus-cultivation-guide" "Nymphaea caerulea water lily"

# Kava (2)
download_image "traditional-kava-preparation" "kava ceremony Piper methysticum"
download_image "kava-cultivation-guide" "Piper methysticum kava plant"

# Kanna (1)
download_image "kanna-cultivation-guide" "Sceletium tortuosum"

# General articles (2)
download_image "responsible-dosing" "herbal tincture dropper botanical"
download_image "how-to-read-coa" "laboratory analysis certificate"

# Fruits (8)
download_image "dragon-fruit-cultivation-guide" "Hylocereus undatus dragon fruit"
download_image "elderberry-cultivation-guide" "Sambucus nigra berries"
download_image "prickly-pear-cultivation-guide" "Opuntia ficus-indica prickly pear"
download_image "pomegranate-cultivation-guide" "Punica granatum pomegranate"
download_image "pomegranate-monograph" "pomegranate fruit Punica"
download_image "blue-java-banana-cultivation-guide" "Musa acuminata banana plant"
download_image "red-spanish-pineapple-cultivation-guide" "Ananas comosus pineapple"
download_image "texas-persimmon-cultivation-guide" "Diospyros texana persimmon"
download_image "santa-rosa-plum-cultivation-guide" "Prunus salicina plum fruit"
download_image "nemaguard-peach-rootstock-guide" "Prunus persica peach fruit"

# Vegetables & Roots (8)
download_image "ginger-cultivation-guide" "Zingiber officinale ginger"
download_image "purple-sweet-potato-cultivation-guide" "Ipomoea batatas sweet potato purple"
download_image "deep-purple-carrot-cultivation-guide" "Daucus carota purple carrot"
download_image "detroit-red-beet-cultivation-guide" "Beta vulgaris red beet"
download_image "heirloom-quinoa-cultivation-guide" "Chenopodium quinoa"
download_image "jerusalem-artichoke-cultivation-guide" "Helianthus tuberosus"
download_image "tropea-onion-cultivation-guide" "Allium cepa red onion"
download_image "redbor-kale-cultivation-guide" "Brassica oleracea kale red"
download_image "heirloom-sugarcane-cultivation-guide" "Saccharum officinarum sugarcane"

# Herbs & Medicinals (8)
download_image "moringa-cultivation-guide" "Moringa oleifera"
download_image "mullein-cultivation-guide" "Verbascum thapsus mullein"
download_image "dandelion-cultivation-guide" "Taraxacum officinale dandelion"
download_image "thai-mint-cultivation-guide" "Mentha arvensis mint"
download_image "passionflower-cultivation-guide" "Passiflora incarnata flower"
download_image "bacopa-monnieri-cultivation-guide" "Bacopa monnieri plant"
download_image "roselle-hibiscus-cultivation-guide" "Hibiscus sabdariffa roselle"
download_image "absinthe-wormwood-cultivation-guide" "Artemisia absinthium wormwood"
download_image "russian-comfrey-cultivation-guide" "Symphytum officinale comfrey"

# Mushrooms (1)
download_image "lions-mane-cultivation-guide" "Hericium erinaceus mushroom"

# Trees & Natives (4)
download_image "davis-mountain-yucca-cultivation-guide" "Yucca elata soaptree"
download_image "yaupon-holly-cultivation-guide" "Ilex vomitoria yaupon"
download_image "agarita-cultivation-guide" "Mahonia trifoliata agarita"
download_image "san-saba-pecan-cultivation-guide" "Carya illinoinensis pecan"

# Grasses & Cover Crops (5)
download_image "switchgrass-cultivation-guide" "Panicum virgatum switchgrass"
download_image "little-bluestem-cultivation-guide" "Schizachyrium scoparium bluestem"
download_image "sideoats-grama-cultivation-guide" "Bouteloua curtipendula sideoats"
download_image "subterranean-clover-cultivation-guide" "Trifolium subterraneum clover"
download_image "duckweed-cultivation-guide" "Lemna minor duckweed"

# Hemp & Cannabis (3)
download_image "high-cbd-hemp-cultivation-guide" "Cannabis sativa hemp"
download_image "industrial-hemp-cultivation-guide" "Cannabis sativa industrial hemp"
download_image "high-thc-cannabis-research-guide" "Cannabis indica flowering"

# Ethnobotanicals (3)
download_image "san-pedro-cultivation-guide" "Echinopsis pachanoi cactus"
download_image "heavenly-blue-morning-glory-guide" "Ipomoea tricolor morning glory"
download_image "hawaiian-baby-woodrose-guide" "Argyreia nervosa flower"

echo ""
echo "=== Results: $ok downloaded, $skip skipped, $fail failed ==="
echo "Total images:"
ls "$IMAGES_DIR"/*.jpg 2>/dev/null | wc -l
