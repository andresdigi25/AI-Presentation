import math


TILESIZE = 32
ROWS = 10
COLS = 15

WINDOW_WIDTH = 1200  # Increased width
WINDOW_HEIGHT = 800  # Increased height

FOV = 60 * (math.pi / 180)

RES = 4
NUM_RAYS = WINDOW_WIDTH // RES