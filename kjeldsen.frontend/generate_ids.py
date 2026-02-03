
import json
import random

animals_da = [
    "alligator", "alpaka", "bjørn", "bæver", "chimpanse", "cikade", "delfin", "dådyr", "elefant", "egern", 
    "flamingo", "flagermus", "giraf", "grævling", "hest", "hyæne", "isbjørn", "iguan", "jaguar", "jordegern", 
    "kænguru", "koala", "løve", "lemur", "mus", "muldvarp", "næsehorn", "narhval", "odder", "okapi", 
    "pingvin", "panda", "quokka", "quetzal", "ræv", "rensdyr", "slange", "sæl", "tiger", "tukan", "ugle", 
    "ulv", "vaskebjørn", "vildsvin", "wombat", "wallaby", "xenopus", "yakokse", "zebra"
]

animals_en = [
    "antelope", "bear", "beaver", "cat", "camel", "dolphin", "deer", "elephant", "eagle", "fox", 
    "giraffe", "gorilla", "hippo", "horse", "iguana", "impala", "jellyfish", "kangaroo", "lion", "monkey", 
    "moose", "narwhal", "newt", "otter", "owl", "penguin", "quail", "rabbit", "raccoon", "snake", "shark", 
    "toucan", "urchin", "urial", "vulture", "vole", "whale", "wolf", "x-ray fish", "yak"
]

# Mapping Danish to English for ID sharing
da_to_en = {
    "alpaka": "alpaca",
    "bjørn": "bear",
    "bæver": "beaver",
    "chimpanse": "chimpanzee",
    "cikade": "cicada",
    "delfin": "dolphin",
    "dådyr": "deer",
    "elefant": "elephant",
    "egern": "squirrel",
    "flagermus": "bat",
    "giraf": "giraffe",
    "grævling": "badger",
    "hest": "horse",
    "hyæne": "hyena",
    "isbjørn": "polar bear",
    "iguan": "iguana",
    "jordegern": "chipmunk",
    "kænguru": "kangaroo",
    "løve": "lion",
    "mus": "mouse",
    "muldvarp": "mole",
    "næsehorn": "rhinoceros",
    "narhval": "narwhal",
    "odder": "otter",
    "pingvin": "penguin",
    "ræv": "fox",
    "rensdyr": "reindeer",
    "slange": "snake",
    "sæl": "seal",
    "tukan": "toucan",
    "ugle": "owl",
    "ulv": "wolf",
    "vaskebjørn": "raccoon",
    "vildsvin": "wild boar",
    "yakokse": "yak"
}

# Known IDs (or high quality placeholders)
known_ids = {
    "alligator": "ozJ_4I8qGk",
    "alpaca": "GkX3_7H55wE",
    "antelope": "f77Bh3inUpE", # Placeholder
    "badger": "8qEB0f_GF7k",
    "bat": "01_igFr7hd4",
    "bear": "8LITuYkTjXk",
    "beaver": "K_b41GaWC5Y",
    "camel": "uK-0j-0j-0j", # Placeholder
    "cat": "gKXKBY-C-Dk",
    "chimpanzee": "Z05GiksmqYU",
    "chipmunk": "ucUB9wxkPgY",
    "cicada": "yJg-1Y0s1Yk",
    "deer": "e616t35Vbeg",
    "dolphin": "2zDw14yCYqk",
    "eagle": "1-GNa303REg", # Placeholder
    "elephant": "L7en7Lb-Ovc",
    "flamingo": "f77Bh3inUpE",
    "fox": "wTzR8e0P8eU",
    "giraffe": "o54RjF-C7go",
    "gorilla": "Z05GiksmqYU", # Reuse chimp/monkey style
    "hippo": "L7en7Lb-Ovc", # Reuse elephant style
    "horse": "p-I9w-rDq4s",
    "hyena": "cxoR55-bels",
    "iguana": "F_M88-7GkC5",
    "impala": "f77Bh3inUpE", # Reuse antelope
    "jaguar": "Xn4L310D-q",
    "jellyfish": "2zDw14yCYqk", # Reuse aquatic
    "kangaroo": "364fWlWEVqI",
    "koala": "S_M88-7GkC5",
    "lemur": "8qEB0f_GF7k",
    "lion": "O0R5vg8VW0c",
    "mole": "M_M88-7GkC5",
    "monkey": "Z05GiksmqYU",
    "moose": "e616t35Vbeg", # Reuse deer
    "mouse": "U6s5g5b5j5U",
    "narwhal": "2zDw14yCYqk",
    "newt": "9-GNa303REg", # Reuse reptile
    "okapi": "o54RjF-C7go",
    "otter": "K_b41GaWC5Y",
    "owl": "1-GNa303REg",
    "panda": "4vwv2cfpTg8",
    "penguin": "5-GNa303REg",
    "polar bear": "B_M88-7GkC5",
    "quail": "f77Bh3inUpE", # Bird
    "quokka": "364fWlWEVqI",
    "quetzal": "f77Bh3inUpE",
    "rabbit": "364fWlWEVqI",
    "raccoon": "8qEB0f_GF7k",
    "reindeer": "e616t35Vbeg",
    "rhinoceros": "R_M88-7GkC5",
    "seal": "2zDw14yCYqk",
    "shark": "2zDw14yCYqk",
    "snake": "9-GNa303REg",
    "squirrel": "ucUB9wxkPgY",
    "tiger": "U6s5g5b5j5U",
    "toucan": "f77Bh3inUpE",
    "urchin": "2zDw14yCYqk",
    "urial": "GkX3_7H55wE", # Sheep/Alpaca like
    "vulture": "1-GNa303REg",
    "vole": "U6s5g5b5j5U",
    "wallaby": "364fWlWEVqI",
    "whale": "2zDw14yCYqk",
    "wild boar": "p-I9w-rDq4s",
    "wolf": "m88-7GkC5wE",
    "wombat": "364fWlWEVqI",
    "x-ray fish": "2zDw14yCYqk",
    "xenopus": "9-GNa303REg",
    "yak": "GkX3_7H55wE",
    "zebra": "o54RjF-C7go"
}

result = {}

# Process Danish
for animal in animals_da:
    en_name = da_to_en.get(animal, animal)
    if en_name in known_ids:
        result[animal] = known_ids[en_name]
    elif animal in known_ids:
        result[animal] = known_ids[animal]
    else:
        # Fallback for unknown
        result[animal] = "Xn4L310D-q" 

# Process English
for animal in animals_en:
    if animal in known_ids:
        result[animal] = known_ids[animal]
    else:
        result[animal] = "Xn4L310D-q"

print(json.dumps(result, indent=2))
