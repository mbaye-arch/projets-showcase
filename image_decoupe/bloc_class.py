from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw


Color = tuple[int, int, int]


@dataclass(frozen=True)
class Bloc:
    """Zone rectangulaire d'une image RGB."""

    x0: int
    y0: int
    x1: int
    y1: int

    def __post_init__(self) -> None:
        if self.x0 > self.x1 or self.y0 > self.y1:
            raise ValueError("Les coordonnees du bloc sont invalides")

    @property
    def width(self) -> int:
        return self.x1 - self.x0 + 1

    @property
    def height(self) -> int:
        return self.y1 - self.y0 + 1

    def colors(self, image: Image.Image) -> list[Color]:
        pixels = image.load()
        return [
            pixels[x, y]
            for x in range(self.x0, self.x1 + 1)
            for y in range(self.y0, self.y1 + 1)
        ]

    def is_uniform(self, image: Image.Image) -> bool:
        colors = self.colors(image)
        return len(set(colors)) == 1

    def average_color(self, image: Image.Image) -> Color:
        colors = self.colors(image)
        total = len(colors)
        return (
            sum(color[0] for color in colors) // total,
            sum(color[1] for color in colors) // total,
            sum(color[2] for color in colors) // total,
        )

    def split(self) -> list[Bloc]:
        if self.width <= 1 or self.height <= 1:
            return [self]

        mid_x = (self.x0 + self.x1) // 2
        mid_y = (self.y0 + self.y1) // 2
        return [
            Bloc(self.x0, self.y0, mid_x, mid_y),
            Bloc(mid_x + 1, self.y0, self.x1, mid_y),
            Bloc(self.x0, mid_y + 1, mid_x, self.y1),
            Bloc(mid_x + 1, mid_y + 1, self.x1, self.y1),
        ]

    def paint(self, image: Image.Image, draw: ImageDraw.ImageDraw) -> None:
        draw.rectangle((self.x0, self.y0, self.x1, self.y1), fill=self.average_color(image))


def build_blocks(image: Image.Image, depth: int) -> list[Bloc]:
    blocks = [Bloc(0, 0, image.width - 1, image.height - 1)]
    for _ in range(depth):
        next_blocks: list[Bloc] = []
        for block in blocks:
            next_blocks.extend(block.split())
        blocks = next_blocks
    return blocks


def create_mosaic(input_path: str | Path, output_path: str | Path, depth: int = 3) -> Path:
    source = Image.open(input_path).convert("RGB")
    result = source.copy()
    draw = ImageDraw.Draw(result)

    for block in build_blocks(source, depth):
        block.paint(source, draw)

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    result.save(output)
    return output
