import pygame
from settings import *
from Ray import *

# Example color mapping for wall types
WALL_COLORS = {
    1: (200, 40, 40),   # Red
    2: (40, 200, 40),   # Green
    3: (40, 40, 200),   # Blue
    4: (200, 200, 40),  # Yellow
    # Add more as needed
}

class Raycaster:
    def __init__(self, player, map):
        self.rays = []
        self.player = player
        self.map = map

        # Load wall textures after display is initialized
        # Only load textures that exist
        self.WALL_TEXTURES = {
            1: pygame.image.load("wall1.png").convert(),
            # 2: pygame.image.load("wall2.png").convert(),  # Remove or comment out if wall2.png does not exist
        }


    def castAllRays(self):
        self.rays = []
        rayAngle = (self.player.rotationAngle - FOV/2)
        for i in range(NUM_RAYS):
            ray = Ray(rayAngle, self.player, self.map)
            ray.cast()
            self.rays.append(ray)

            rayAngle += FOV / NUM_RAYS
    
    def render(self, screen):

        i = 0
        # rendering 2d rays from 2d view
        for ray in self.rays:
            # ray.render(screen)
            # rendering 3d walls over the 2d view

            line_height = (32 / ray.distance) * 415

            draw_begin = (WINDOW_HEIGHT / 2) - (line_height / 2)
            draw_end = line_height

            # Determine wall type at hit location
            wall_type = getattr(ray, "wall_type", 1)  # Default to 1 if not set
            texture = self.WALL_TEXTURES.get(wall_type, self.WALL_TEXTURES[1])

            # Calculate texture_x: the x coordinate on the texture to sample
            # Assume ray.hit_x and ray.hit_y are the exact hit coordinates
            if ray.hit_vertical:
                texture_x = int(ray.hit_y) % texture.get_width()
            else:
                texture_x = int(ray.hit_x) % texture.get_width()

            # Sample the texture column and scale it to wall_height
            texture_column = texture.subsurface(texture_x, 0, 1, texture.get_height())
            texture_column = pygame.transform.scale(texture_column, (1, int(line_height)))

            # Draw the texture column at the correct position
            screen.blit(texture_column, (i*RES, draw_begin))

            i += 1
