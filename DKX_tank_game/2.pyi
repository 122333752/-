import pygame
import random

# ========== 初始化 ==========
pygame.init()
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("坦克大战")
clock = pygame.time.Clock()
FPS = 60

# ========== 颜色定义 ==========
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (220, 50, 50)
GREEN = (50, 180, 50)
BLUE = (50, 100, 220)
GRAY = (130, 130, 130)
YELLOW = (255, 200, 50)

# ========== 游戏参数 ==========
TANK_SIZE = 40
BULLET_SIZE = 6
TANK_SPEED = 3
BULLET_SPEED = 6
ENEMY_COUNT = 5

# ========== 字体 ==========
font = pygame.font.SysFont("simhei", 24)
big_font = pygame.font.SysFont("simhei", 48)

# ========== 坦克类 ==========
class Tank:
    def __init__(self, x, y, color, is_player=False):
        self.rect = pygame.Rect(x, y, TANK_SIZE, TANK_SIZE)
        self.color = color
        self.direction = "up"  # up/down/left/right
        self.is_player = is_player
        self.alive = True
        self.shoot_cd = 0  # 射击冷却
        self.move_cd = 0   # 敌方转向冷却

    def move(self, dx, dy, walls):
        # 计算新位置
        new_rect = self.rect.copy()
        new_rect.x += dx
        new_rect.y += dy

        # 边界检测
        if new_rect.left < 0 or new_rect.right > SCREEN_WIDTH:
            return
        if new_rect.top < 0 or new_rect.bottom > SCREEN_HEIGHT:
            return

        # 墙体碰撞检测
        for wall in walls:
            if new_rect.colliderect(wall.rect):
                return

        self.rect = new_rect
        # 更新朝向
        if dx > 0: self.direction = "right"
        elif dx < 0: self.direction = "left"
        elif dy > 0: self.direction = "down"
        elif dy < 0: self.direction = "up"

    def shoot(self):
        if self.shoot_cd > 0:
            return None
        self.shoot_cd = 30  # 冷却帧数

        # 子弹从炮口生成
        if self.direction == "up":
            bx = self.rect.centerx - BULLET_SIZE//2
            by = self.rect.top - BULLET_SIZE
            dx, dy = 0, -BULLET_SPEED
        elif self.direction == "down":
            bx = self.rect.centerx - BULLET_SIZE//2
            by = self.rect.bottom
            dx, dy = 0, BULLET_SPEED
        elif self.direction == "left":
            bx = self.rect.left - BULLET_SIZE
            by = self.rect.centery - BULLET_SIZE//2
            dx, dy = -BULLET_SPEED, 0
        else:  # right
            bx = self.rect.right
            by = self.rect.centery - BULLET_SIZE//2
            dx, dy = BULLET_SPEED, 0

        return Bullet(bx, by, dx, dy, self.is_player)

    def update(self):
        if self.shoot_cd > 0:
            self.shoot_cd -= 1
        if self.move_cd > 0:
            self.move_cd -= 1

    def draw(self, surface):
        # 绘制坦克主体
        pygame.draw.rect(surface, self.color, self.rect)
        # 绘制炮管
        if self.direction == "up":
            pygame.draw.rect(surface, self.color,
                           (self.rect.centerx-3, self.rect.top-10, 6, 15))
        elif self.direction == "down":
            pygame.draw.rect(surface, self.color,
                           (self.rect.centerx-3, self.rect.bottom-5, 6, 15))
        elif self.direction == "left":
            pygame.draw.rect(surface, self.color,
                           (self.rect.left-10, self.rect.centery-3, 15, 6))
        else:
            pygame.draw.rect(surface, self.color,
                           (self.rect.right-5, self.rect.centery-3, 15, 6))

# ========== 子弹类 ==========
class Bullet:
    def __init__(self, x, y, dx, dy, is_player_bullet):
        self.rect = pygame.Rect(x, y, BULLET_SIZE, BULLET_SIZE)
        self.dx = dx
        self.dy = dy
        self.is_player = is_player_bullet
        self.active = True

    def update(self):
        self.rect.x += self.dx
        self.rect.y += self.dy
        # 出界销毁
        if (self.rect.right < 0 or self.rect.left > SCREEN_WIDTH or
            self.rect.bottom < 0 or self.rect.top > SCREEN_HEIGHT):
            self.active = False

    def draw(self, surface):
        pygame.draw.circle(surface, YELLOW, self.rect.center, BULLET_SIZE//2)

# ========== 砖墙障碍物类 ==========
class Wall:
    def __init__(self, x, y, w=40, h=40):
        self.rect = pygame.Rect(x, y, w, h)

    def draw(self, surface):
        pygame.draw.rect(surface, GRAY, self.rect)
        pygame.draw.rect(surface, BLACK, self.rect, 2)

# ========== 生成地图：砖墙布局（可修改为姓名缩写形状） ==========
def create_walls():
    walls = []
    # 四周边界墙
    for x in range(0, SCREEN_WIDTH, 40):
        walls.append(Wall(x, 40, 40, 20))  # 顶部
        walls.append(Wall(x, SCREEN_HEIGHT-60, 40, 20))  # 底部
    for y in range(40, SCREEN_HEIGHT-60, 40):
        walls.append(Wall(0, y, 20, 40))  # 左侧
        walls.append(Wall(SCREEN_WIDTH-20, y, 20, 40))  # 右侧

    # ---------- 姓名缩写区域：修改此处砖块拼成你的名字拼音首字母 ----------
    # 示例：拼成 "ABC" 形状，你可以替换成自己的姓名缩写
    # 字母 A
    walls.append(Wall(300, 200))
    walls.append(Wall(300, 240))
    walls.append(Wall(300, 280))
    walls.append(Wall(340, 200))
    walls.append(Wall(340, 240))
    walls.append(Wall(340, 280))
    walls.append(Wall(320, 200))
    walls.append(Wall(320, 260))

    # 字母 B
    walls.append(Wall(400, 200))
    walls.append(Wall(400, 240))
    walls.append(Wall(400, 280))
    walls.append(Wall(440, 200))
    walls.append(Wall(440, 240))
    walls.append(Wall(440, 280))
    walls.append(Wall(420, 220))
    walls.append(Wall(420, 260))
    # -------------------------------------------------------------------

    # 随机散落砖块增加可玩性
    for _ in range(12):
        wx = random.randint(60, SCREEN_WIDTH-100)
        wy = random.randint(80, SCREEN_HEIGHT-120)
        # 避开玩家出生点
        if abs(wx - 100) > 80 or abs(wy - 500) > 80:
            walls.append(Wall(wx, wy))

    return walls

# ========== 生成敌方坦克 ==========
def create_enemies(count, walls):
    enemies = []
    for _ in range(count):
        while True:
            ex = random.randint(40, SCREEN_WIDTH - TANK_SIZE - 40)
            ey = random.randint(60, 200)
            enemy = Tank(ex, ey, RED)
            # 确保不与墙体重叠
            overlap = False
            for wall in walls:
                if enemy.rect.colliderect(wall.rect):
                    overlap = True
                    break
            if not overlap:
                enemies.append(enemy)
                break
    return enemies

# ========== 主游戏函数 ==========
def main():
    # 加载背景底图（加分项：取消注释并替换图片文件即可）
    # background = pygame.image.load("campus_bg.png").convert()
    # background = pygame.transform.scale(background, (SCREEN_WIDTH, SCREEN_HEIGHT))

    walls = create_walls()
    player = Tank(100, 500, GREEN, is_player=True)
    enemies = create_enemies(ENEMY_COUNT, walls)
    bullets = []

    # 姓名标识（界面右上角显示，满足身份标识加分）
    name_tag = font.render("姓名缩写：DKX", True, WHITE)  # 替换成你的缩写

    game_state = "playing"  # playing / win / lose
    running = True

    while running:
        clock.tick(FPS)
        # ========== 事件处理 ==========
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE and game_state == "playing":
                    bullet = player.shoot()
                    if bullet:
                        bullets.append(bullet)
                # 重开游戏
                if event.key == pygame.K_r and game_state != "playing":
                    walls = create_walls()
                    player = Tank(100, 500, GREEN, is_player=True)
                    enemies = create_enemies(ENEMY_COUNT, walls)
                    bullets = []
                    game_state = "playing"

        # ========== 游戏更新 ==========
        if game_state == "playing":
            # 玩家移动
            keys = pygame.key.get_pressed()
            dx, dy = 0, 0
            if keys[pygame.K_w]: dy = -TANK_SPEED
            elif keys[pygame.K_s]: dy = TANK_SPEED
            elif keys[pygame.K_a]: dx = -TANK_SPEED
            elif keys[pygame.K_d]: dx = TANK_SPEED
            if dx != 0 or dy != 0:
                player.move(dx, dy, walls)

            player.update()

            # 敌方AI
            for enemy in enemies:
                if not enemy.alive:
                    continue
                enemy.update()

                # 随机转向
                if enemy.move_cd <= 0:
                    enemy.direction = random.choice(["up","down","left","right"])
                    enemy.move_cd = random.randint(30, 90)

                # 按方向移动
                edx, edy = 0, 0
                if enemy.direction == "up": edy = -TANK_SPEED*0.7
                elif enemy.direction == "down": edy = TANK_SPEED*0.7
                elif enemy.direction == "left": edx = -TANK_SPEED*0.7
                elif enemy.direction == "right": edx = TANK_SPEED*0.7
                enemy.move(edx, edy, walls)

                # 随机射击
                if random.random() < 0.015:
                    bullet = enemy.shoot()
                    if bullet:
                        bullets.append(bullet)

            # 子弹更新 + 碰撞检测
            for bullet in bullets:
                if not bullet.active:
                    continue
                bullet.update()

                # 子弹打墙
                for wall in walls[:]:
                    if bullet.rect.colliderect(wall.rect):
                        bullet.active = False
                        walls.remove(wall)
                        break

                # 玩家子弹打敌人
                if bullet.is_player:
                    for enemy in enemies:
                        if enemy.alive and bullet.rect.colliderect(enemy.rect):
                            enemy.alive = False
                            bullet.active = False
                            break
                # 敌方子弹打玩家
                else:
                    if bullet.rect.colliderect(player.rect):
                        game_state = "lose"
                        bullet.active = False

            # 清理失效子弹
            bullets = [b for b in bullets if b.active]

            # 胜利判定
            alive_enemies = [e for e in enemies if e.alive]
            if len(alive_enemies) == 0:
                game_state = "win"

        # ========== 绘制 ==========
        screen.fill(BLACK)
        # 有底图时替换为 screen.blit(background, (0,0))

        # 绘制墙体
        for wall in walls:
            wall.draw(screen)

        # 绘制坦克
        player.draw(screen)
        for enemy in enemies:
            if enemy.alive:
                enemy.draw(screen)

        # 绘制子弹
        for bullet in bullets:
            bullet.draw(screen)

        # 绘制UI信息
        alive_count = len([e for e in enemies if e.alive])
        info_text = font.render(f"剩余敌人：{alive_count}", True, WHITE)
        screen.blit(info_text, (30, 10))
        screen.blit(name_tag, (SCREEN_WIDTH - 180, 10))  # 姓名标识
        tip_text = font.render("WASD移动 空格射击", True, WHITE)
        screen.blit(tip_text, (30, SCREEN_HEIGHT - 30))

        # 胜负画面
        if game_state == "win":
            win_text = big_font.render("胜利！按 R 重新开始", True, GREEN)
            screen.blit(win_text, (SCREEN_WIDTH//2 - win_text.get_width()//2,
                                  SCREEN_HEIGHT//2 - 30))
        elif game_state == "lose":
            lose_text = big_font.render("失败！按 R 重新开始", True, RED)
            screen.blit(lose_text, (SCREEN_WIDTH//2 - lose_text.get_width()//2,
                                   SCREEN_HEIGHT//2 - 30))

        pygame.display.flip()

    pygame.quit()

if __name__ == "__main__":
    main()