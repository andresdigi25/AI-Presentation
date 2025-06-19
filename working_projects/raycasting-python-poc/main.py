import pygame
from settings import *
from Map import *
from Player import *
from Raycaster import *

pygame.init()  # Initialize Pygame

screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))

map = Map()
player = Player()
raycaster = Raycaster(player, map)

# background_image = pygame.image.load("background.png")

clock = pygame.time.Clock()

font = pygame.font.SysFont("Arial", 18)

MINIMAP_SIZE = 200  # pixels

while True:
    clock.tick(60)
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            exit()
    
    player.update()
    raycaster.castAllRays()

    # Fill background with black for clarity
    screen.fill((0, 0, 0))

    # Draw 3D view (raycaster)
    raycaster.render(screen)

    # Draw minimap in the top-left corner
    minimap_surface = pygame.Surface((MINIMAP_SIZE, MINIMAP_SIZE))
    minimap_surface.fill((30, 30, 30))
    map.render(minimap_surface)
    player.render(minimap_surface)
    screen.blit(minimap_surface, (10, 10))

    # Draw FPS counter
    fps = int(clock.get_fps())
    fps_text = font.render(f"FPS: {fps}", True, (255, 255, 0))
    screen.blit(fps_text, (MINIMAP_SIZE + 20, 10))

    # Draw player position
    pos_text = font.render(f"Pos: ({int(player.x)}, {int(player.y)})", True, (255, 255, 255))
    screen.blit(pos_text, (MINIMAP_SIZE + 20, 30))

    pygame.display.update()
