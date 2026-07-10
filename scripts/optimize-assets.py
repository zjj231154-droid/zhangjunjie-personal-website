from pathlib import Path

from PIL import Image, ImageOps


ASSETS_DIR = Path(__file__).resolve().parents[1] / "public" / "assets"
IMAGE_EXTS = {".png", ".jpg", ".jpeg"}
MAX_DIMENSION = 2000
QUALITY = 78


def convert_image(path: Path) -> None:
    output = path.with_suffix(".webp")
    with Image.open(path) as image:
        image = ImageOps.exif_transpose(image)
        if max(image.size) > MAX_DIMENSION:
            image.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.Resampling.LANCZOS)

        has_alpha = image.mode in {"RGBA", "LA"} or (
            image.mode == "P" and "transparency" in image.info
        )
        if has_alpha:
            image = image.convert("RGBA")
        else:
            image = image.convert("RGB")

        image.save(output, "WEBP", quality=QUALITY, method=6)

    path.unlink()
    print(f"{path.relative_to(ASSETS_DIR)} -> {output.relative_to(ASSETS_DIR)}")


def main() -> None:
    for path in sorted(ASSETS_DIR.rglob("*")):
        if path.is_file() and path.suffix.lower() in IMAGE_EXTS:
            convert_image(path)


if __name__ == "__main__":
    main()
