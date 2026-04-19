from __future__ import annotations

import argparse

from bloc_class import create_mosaic


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Transforme une image en mosaique par decoupage recursif.")
    parser.add_argument("image", help="Chemin de l'image source")
    parser.add_argument("-o", "--output", default="outputs/mosaic.png", help="Chemin de l'image generee")
    parser.add_argument("-d", "--depth", type=int, default=3, help="Profondeur de decoupage")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    output = create_mosaic(args.image, args.output, args.depth)
    print(f"Image generee : {output}")


if __name__ == "__main__":
    main()
