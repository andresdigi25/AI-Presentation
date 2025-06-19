import pygame

pygame.init()
size = 64
surface = pygame.Surface((size, size))

# Fill with base color
surface.fill((180, 60, 40))

# Draw horizontal brick lines
for y in range(0, size, 16):
    pygame.draw.line(surface, (120, 30, 20), (0, y), (size, y), 3)

# Draw vertical brick lines (offset every other row)
for y in range(0, size, 32):
    for x in range(0, size, 32):
        pygame.draw.line(surface, (120, 30, 20), (x, y), (x, y + 16), 3)
        pygame.draw.line(surface, (120, 30, 20), (x + 16, y + 16), (x + 16, y + 32), 3)

pygame.image.save(surface, "wall1.png")
print("Texture saved as wall1.png")
