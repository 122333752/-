import pygame
import random
import math
import sys

pygame.init()

WIDTH, HEIGHT = 960, 640
FPS = 60
TILE = 40

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("DKX 坦克大战")
clock = pygame.time.Clock()

FONT = pygame.font.SysFont("simhei", 24)
SMALL_FONT = pygame.font.SysFont("simhei", 18)
BIG_FONT = pygame.font.SysFont("simhei", 52)

BG = (30, 34, 38)
GRID = (45, 50, 56)
WALL = (120, 95, 70)
WALL_EDGE = (170, 135, 95)
PLAYER_COLOR = (70, 170, 255)
ENEMY_COLOR = (230, 80, 75)
BULLET_COLOR = (255, 225, 100)
TEXT = (240, 240, 240)
GREEN = (70, 210, 120)
RED = (235, 85, 85)

def clamp(v, a, b):
    return max(a, min(b, v))

class Wall:
    def __init__(self, x, y, w=TILE, h=TILE):
        self.rect = pygame.Rect(x, y, w, h)

    def draw(self, surf):
        pygame.draw.rect(surf, WALL, self.rect, border_radius=4)
        pygame.draw.rect(surf, WALL_EDGE, self.rect, 2, border_radius=4)

class Bullet:
    def __init__(self, x, y, angle, owner):
        self.owner = owner
        self.speed = 8
        self.radius = 5
        self.alive = True
        self.x = float(x)
        self.y = float(y)
        self.vx = math.cos(angle) * self.speed
        self.vy = math.sin(angle) * self.speed

    @property
    def rect(self):
        return pygame.Rect(int(self.x - self.radius), int(self.y - self.radius),
                           self.radius * 2, self.radius * 2)

    def update(self, walls):
        self.x += self.vx
        self.y += self.vy
        if self.x < 0 or self.x > WIDTH or self.y < 0 or self.y > HEIGHT:
            self.alive = False
            return
        for wall in walls:
            if self.rect.colliderect(wall.rect):
                self.alive = False
                return

    def draw(self, surf):
        pygame.draw.circle(surf, BULLET_COLOR, (int(self.x), int(self.y)), self.radius)

class Tank:
    def __init__(self, x, y, color, speed=3):
        self.x = float(x)
        self.y = float(y)
        self.size = 34
        self.color = color
        self.speed = speed
        self.angle = -math.pi / 2
        self.cooldown = 0
        self.hp = 3
        self.alive = True

    @property
    def rect(self):
        return pygame.Rect(int(self.x - self.size/2), int(self.y - self.size/2),
                           self.size, self.size)

    def can_move(self, nx, ny, walls):
        test = pygame.Rect(int(nx - self.size/2), int(ny - self.size/2), self.size, self.size)
        if not pygame.Rect(0, 0, WIDTH, HEIGHT).contains(test):
            return False
        for wall in walls:
            if test.colliderect(wall.rect):
                return False
        return True

    def move(self, dx, dy, walls):
        if dx == 0 and dy == 0:
            return
        length = math.hypot(dx, dy)
        dx /= length
        dy /= length
        self.angle = math.atan2(dy, dx)

        nx = self.x + dx * self.speed
        if self.can_move(nx, self.y, walls):
            self.x = nx
        ny = self.y + dy * self.speed
        if self.can_move(self.x, ny, walls):
            self.y = ny

    def shoot(self):
        if self.cooldown <= 0 and self.alive:
            self.cooldown = 24
            muzzle = self.size * 0.72
            bx = self.x + math.cos(self.angle) * muzzle
            by = self.y + math.sin(self.angle) * muzzle
            return Bullet(bx, by, self.angle, self)
        return None

    def update(self):
        if self.cooldown > 0:
            self.cooldown -= 1

    def damage(self):
        self.hp -= 1
        if self.hp <= 0:
            self.alive = False

    def draw(self, surf):
        if not self.alive:
            return

        rect = self.rect
        pygame.draw.rect(surf, self.color, rect, border_radius=7)
        pygame.draw.rect(surf, (20, 20, 20), rect, 2, border_radius=7)

        cx, cy = int(self.x), int(self.y)
        end = (
            int(cx + math.cos(self.angle) * 25),
            int(cy + math.sin(self.angle) * 25)
        )
        pygame.draw.line(surf, (25, 25, 25), (cx, cy), end, 7)
        pygame.draw.circle(surf, (50, 50, 50), (cx, cy), 8)

        # 血条
        bar_w = 34
        pygame.draw.rect(surf, (60, 60, 60), (cx - bar_w//2, cy - 29, bar_w, 5))
        hp_w = int(bar_w * max(self.hp, 0) / 3)
        pygame.draw.rect(surf, GREEN if self.hp >= 2 else RED,
                         (cx - bar_w//2, cy - 29, hp_w, 5))

class EnemyTank(Tank):
    def __init__(self, x, y):
        super().__init__(x, y, ENEMY_COLOR, speed=1.65)
        self.change_timer = 0
        self.fire_timer = random.randint(40, 90)
        self.dir = random.choice([(1,0),(-1,0),(0,1),(0,-1)])

    def ai(self, player, walls):
        if not self.alive:
            return None

        self.change_timer -= 1
        self.fire_timer -= 1

        dist = math.hypot(player.x - self.x, player.y - self.y)

        # 离玩家较近时会大致追踪玩家
        if dist < 330:
            dx = player.x - self.x
            dy = player.y - self.y
            if abs(dx) > abs(dy):
                self.dir = (1 if dx > 0 else -1, 0)
            else:
                self.dir = (0, 1 if dy > 0 else -1)
        elif self.change_timer <= 0:
            self.dir = random.choice([(1,0),(-1,0),(0,1),(0,-1)])
            self.change_timer = random.randint(40, 100)

        oldx, oldy = self.x, self.y
        self.move(self.dir[0], self.dir[1], walls)
        if abs(oldx - self.x) < 0.1 and abs(oldy - self.y) < 0.1:
            self.dir = random.choice([(1,0),(-1,0),(0,1),(0,-1)])
            self.change_timer = 20

        if self.fire_timer <= 0:
            dx = player.x - self.x
            dy = player.y - self.y
            self.angle = math.atan2(dy, dx)
            self.fire_timer = random.randint(60, 115)
            return self.shoot()
        return None

def make_walls():
    walls = []

    # 四周零散障碍，中央用墙体拼出 DKX
    # D
    for r in range(4, 11):
        walls.append(Wall(280, r*TILE))
    for c in range(7, 10):
        walls.append(Wall(c*TILE, 4*TILE))
        walls.append(Wall(c*TILE, 10*TILE))
    for r in range(5, 10):
        walls.append(Wall(10*TILE, r*TILE))

    # K
    for r in range(4, 11):
        walls.append(Wall(12*TILE, r*TILE))
    for i in range(4):
        walls.append(Wall((13+i)*TILE, (7-i)*TILE))
        walls.append(Wall((13+i)*TILE, (7+i)*TILE))

    # X
    for i in range(7):
        walls.append(Wall((18+i)*TILE, (4+i)*TILE))
        walls.append(Wall((24-i)*TILE, (4+i)*TILE))

    # 几块额外障碍
    extras = [
        (1,3),(2,3),(3,3),(1,12),(2,12),(3,12),
        (20,2),(21,2),(22,2),(20,13),(21,13),(22,13),
        (5,6),(5,7),(5,8),(17,6),(17,7),(17,8)
    ]
    for c, r in extras:
        walls.append(Wall(c*TILE, r*TILE))

    return walls

def draw_background():
    screen.fill(BG)
    for x in range(0, WIDTH, TILE):
        pygame.draw.line(screen, GRID, (x, 0), (x, HEIGHT), 1)
    for y in range(0, HEIGHT, TILE):
        pygame.draw.line(screen, GRID, (0, y), (WIDTH, y), 1)

def new_game():
    player = Tank(90, HEIGHT - 90, PLAYER_COLOR, speed=3.2)
    enemies = [
        EnemyTank(WIDTH - 90, 90),
        EnemyTank(WIDTH - 120, HEIGHT - 100),
        EnemyTank(100, 100),
    ]
    walls = make_walls()
    bullets = []
    return player, enemies, walls, bullets, "playing"

player, enemies, walls, bullets, state = new_game()

running = True
while running:
    clock.tick(FPS)

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                running = False
            if event.key == pygame.K_r and state != "playing":
                player, enemies, walls, bullets, state = new_game()
            if event.key == pygame.K_SPACE and state == "playing":
                b = player.shoot()
                if b:
                    bullets.append(b)

    if state == "playing":
        keys = pygame.key.get_pressed()
        dx = (1 if keys[pygame.K_d] or keys[pygame.K_RIGHT] else 0) - \
             (1 if keys[pygame.K_a] or keys[pygame.K_LEFT] else 0)
        dy = (1 if keys[pygame.K_s] or keys[pygame.K_DOWN] else 0) - \
             (1 if keys[pygame.K_w] or keys[pygame.K_UP] else 0)

        player.move(dx, dy, walls)
        player.update()

        for enemy in enemies:
            enemy.update()
            b = enemy.ai(player, walls)
            if b:
                bullets.append(b)

        for bullet in bullets:
            bullet.update(walls)

            if not bullet.alive:
                continue

            if bullet.owner is player:
                for enemy in enemies:
                    if enemy.alive and bullet.rect.colliderect(enemy.rect):
                        enemy.damage()
                        bullet.alive = False
                        break
            else:
                if player.alive and bullet.rect.colliderect(player.rect):
                    player.damage()
                    bullet.alive = False

        bullets = [b for b in bullets if b.alive]
        enemies = [e for e in enemies if e.alive]

        if not player.alive:
            state = "lose"
        elif not enemies:
            state = "win"

    draw_background()

    for wall in walls:
        wall.draw(screen)

    for bullet in bullets:
        bullet.draw(screen)

    player.draw(screen)
    for enemy in enemies:
        enemy.draw(screen)

    title = FONT.render("DKX 坦克大战", True, TEXT)
    screen.blit(title, (12, 10))

    info = SMALL_FONT.render(
        f"生命: {max(player.hp,0)}    敌人: {len(enemies)}    WASD/方向键移动  空格射击",
        True, TEXT
    )
    screen.blit(info, (12, 42))

    tag = SMALL_FONT.render("地图身份标识：DKX", True, (255, 210, 110))
    screen.blit(tag, (WIDTH - 180, 14))

    if state in ("win", "lose"):
        overlay = pygame.Surface((WIDTH, HEIGHT), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 150))
        screen.blit(overlay, (0, 0))

        msg = "胜利！" if state == "win" else "失败！"
        color = GREEN if state == "win" else RED
        text = BIG_FONT.render(msg, True, color)
        sub = FONT.render("按 R 重新开始，按 ESC 退出", True, TEXT)
        screen.blit(text, text.get_rect(center=(WIDTH//2, HEIGHT//2 - 30)))
        screen.blit(sub, sub.get_rect(center=(WIDTH//2, HEIGHT//2 + 35)))

    pygame.display.flip()

pygame.quit()
sys.exit()
