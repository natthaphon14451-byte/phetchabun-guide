import os
from PIL import Image, ImageDraw, ImageFont

WIDTH = 2500
HEIGHT = 1686
SPLIT_Y = 843

img = Image.new("RGB", (WIDTH, HEIGHT), "#FFFFFF")
draw = ImageDraw.Draw(img)

# Fonts
font_path = "C:/Windows/Fonts/LeelawUI.ttf"
font_bold_path = "C:/Windows/Fonts/Leelawdb.ttf"
if not os.path.exists(font_bold_path):
    font_bold_path = "C:/Windows/Fonts/tahomabd.ttf"
if not os.path.exists(font_path):
    font_path = "C:/Windows/Fonts/tahoma.ttf"

def get_font(size, bold=False):
    fp = font_bold_path if bold else font_path
    try:
        return ImageFont.truetype(fp, size)
    except Exception:
        return ImageFont.load_default()

# ==============================================================
# SECTION A: TOP BANNER (เข้าชมเว็บไซต์หลัก)
# ==============================================================
top_bg = Image.new("RGB", (WIDTH, SPLIT_Y), "#064E3B")
top_draw = ImageDraw.Draw(top_bg)

for y in range(SPLIT_Y):
    ratio = y / SPLIT_Y
    r = int(6 + (15 - 6) * ratio)
    g = int(78 + (118 - 78) * ratio)
    b = int(59 + (110 - 59) * ratio)
    top_draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

img.paste(top_bg, (0, 0))
top_draw_main = ImageDraw.Draw(img)

# Decorative Badge in Top Banner
badge_w, badge_h = 760, 64
badge_x = (WIDTH - badge_w) // 2
badge_y = 75
top_draw_main.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h], radius=32, fill=(255, 255, 255, 30), outline=(255, 255, 255, 80), width=2)
f_badge = get_font(30, bold=True)
top_draw_main.text((WIDTH // 2, badge_y + 32), "PHETCHABUN OFFICIAL TRAVEL GUIDE", font=f_badge, fill="#A7F3D0", anchor="mm")

# Top Title
f_title = get_font(88, bold=True)
top_draw_main.text((WIDTH // 2, 235), "เข้าชมเว็บไซต์หลัก", font=f_title, fill="#FFFFFF", anchor="mm")

# Top Subtitle
f_sub = get_font(44, bold=False)
top_draw_main.text((WIDTH // 2, 345), "คู่มือท่องเที่ยวเพชรบูรณ์ มรดกโลกศรีเทพ & รวมที่พักเขาค้อ-ภูทับเบิก", font=f_sub, fill="#E2E8F0", anchor="mm")

# Top Button CTA Pill
btn_w, btn_h = 680, 110
btn_x = (WIDTH - btn_w) // 2
btn_y = 450
top_draw_main.rounded_rectangle([btn_x, btn_y, btn_x + btn_w, btn_y + btn_h], radius=55, fill="#10B981", outline="#34D399", width=3)
f_btn = get_font(46, bold=True)
top_draw_main.text((WIDTH // 2, btn_y + 55), "แตะเพื่อเปิดหน้าเว็บไซต์ >", font=f_btn, fill="#FFFFFF", anchor="mm")

# Hint text
f_hint = get_font(32, bold=False)
top_draw_main.text((WIDTH // 2, 620), "ระบบ Responsive รองรับมือถือและคอมพิวเตอร์แบบเต็มรูปแบบ", font=f_hint, fill="#94A3B8", anchor="mm")

# Bottom divider line of Section A
draw.line([(0, SPLIT_Y), (WIDTH, SPLIT_Y)], fill="#CBD5E1", width=4)

# ==============================================================
# HELPER: DRAW CLEAN SHAPES / ICONS
# ==============================================================
def draw_home_icon(d, cx, cy, color):
    # Roof triangle
    d.polygon([(cx, cy - 35), (cx - 40, cy + 5), (cx + 40, cy + 5)], fill=color)
    # House body
    d.rectangle([cx - 30, cy + 5, cx + 30, cy + 40], fill=color)
    # Door
    d.rectangle([cx - 10, cy + 18, cx + 10, cy + 40], fill="#FFFFFF")

def draw_coffee_icon(d, cx, cy, color):
    # Cup body
    d.rounded_rectangle([cx - 32, cy - 10, cx + 20, cy + 35], radius=10, fill=color)
    # Cup handle
    d.arc([cx + 10, cy - 5, cx + 38, cy + 25], start=-90, end=90, fill=color, width=8)
    # Steam waves
    d.line([(cx - 18, cy - 20), (cx - 18, cy - 32)], fill=color, width=4)
    d.line([(cx - 4, cy - 24), (cx - 4, cy - 36)], fill=color, width=4)
    d.line([(cx + 10, cy - 20), (cx + 10, cy - 32)], fill=color, width=4)

def draw_phone_icon(d, cx, cy, color):
    # Cross / Aid symbol & Handset
    d.rectangle([cx - 35, cy - 12, cx + 35, cy + 12], fill=color)
    d.rectangle([cx - 12, cy - 35, cx + 12, cy + 35], fill=color)

# ==============================================================
# SECTION B, C, D: BOTTOM 3 BLOCKS
# ==============================================================
col_w = WIDTH // 3 # 833 px
bot_h = HEIGHT - SPLIT_Y # 843 px

cols_data = [
    {
        "title": "ค้นหาที่พักแนะนำ",
        "subtitle": "เขาค้อ • ภูทับเบิก",
        "desc": "รวมรีสอร์ทวิวหมอก & เต็นท์โดม\nเช็คราคา เบอร์โทร และ LINE ID จองตรง",
        "badge": "ยอดนิยมอันดับ 1",
        "badge_color": "#ECFDF5",
        "badge_text_color": "#065F46",
        "badge_border": "#A7F3D0",
        "btn_text": "ดูที่พักทั้งหมด >",
        "btn_bg": "#059669",
        "icon_drawer": draw_home_icon,
        "icon_color": "#059669",
        "circle_bg": "#D1FAE5"
    },
    {
        "title": "จุดชมวิว & คาเฟ่",
        "subtitle": "เขาค้อ • ผาซ่อนแก้ว",
        "desc": "พิกัดชมทะเลหมอก 360 องศา\nคาเฟ่ยอดฮิต Pino Latte และทุ่งกังหันลม",
        "badge": "จุดเช็คอินห้ามพลาด",
        "badge_color": "#FFFBEB",
        "badge_text_color": "#92400E",
        "badge_border": "#FDE68A",
        "btn_text": "ค้นหาจุดชมวิว >",
        "btn_bg": "#D97706",
        "icon_drawer": draw_coffee_icon,
        "icon_color": "#D97706",
        "circle_bg": "#FEF3C7"
    },
    {
        "title": "ติดต่อฉุกเฉิน",
        "subtitle": "เบอร์สำคัญ & ช่วยเหลือ",
        "desc": "ตำรวจท่องเที่ยว 1155\nกู้ภัยเพชรบูรณ์ 1669\nสภ.เขาค้อ และข้อมูลการเดินทาง",
        "badge": "ศูนย์ช่วยเหลือ 24 ชม.",
        "badge_color": "#EFF6FF",
        "badge_text_color": "#1E40AF",
        "badge_border": "#BFDBFE",
        "btn_text": "ดูเบอร์ติดต่อ >",
        "btn_bg": "#2563EB",
        "icon_drawer": draw_phone_icon,
        "icon_color": "#2563EB",
        "circle_bg": "#DBEAFE"
    }
]

for i, col in enumerate(cols_data):
    x_start = i * col_w
    x_end = (i + 1) * col_w if i < 2 else WIDTH
    x_center = (x_start + x_end) // 2
    
    # Fill background
    draw.rectangle([x_start, SPLIT_Y + 1, x_end, HEIGHT], fill="#F8FAFC")
    
    # Vertical divider line
    if i > 0:
        draw.line([(x_start, SPLIT_Y), (x_start, HEIGHT)], fill="#E2E8F0", width=4)
        
    # Card container
    card_margin = 35
    cx1 = x_start + card_margin
    cy1 = SPLIT_Y + card_margin
    cx2 = x_end - card_margin
    cy2 = HEIGHT - card_margin
    
    # Draw card
    draw.rounded_rectangle([cx1, cy1, cx2, cy2], radius=32, fill="#FFFFFF", outline="#E2E8F0", width=3)
    
    # Top Tag Badge
    badge_w, badge_h = 360, 54
    bx1 = x_center - badge_w // 2
    by1 = cy1 + 35
    draw.rounded_rectangle([bx1, by1, bx1 + badge_w, by1 + badge_h], radius=27, fill=col["badge_color"], outline=col["badge_border"], width=2)
    f_cbadge = get_font(28, bold=True)
    draw.text((x_center, by1 + 27), col["badge"], font=f_cbadge, fill=col["badge_text_color"], anchor="mm")
    
    # Icon Circle
    icon_cy = cy1 + 160
    icon_r = 50
    draw.ellipse([x_center - icon_r, icon_cy - icon_r, x_center + icon_r, icon_cy + icon_r], fill=col["circle_bg"])
    col["icon_drawer"](draw, x_center, icon_cy, col["icon_color"])
    
    # Title
    f_ctitle = get_font(54, bold=True)
    draw.text((x_center, cy1 + 265), col["title"], font=f_ctitle, fill="#0F172A", anchor="mm")
    
    # Subtitle
    f_csub = get_font(34, bold=False)
    draw.text((x_center, cy1 + 335), col["subtitle"], font=f_csub, fill="#64748B", anchor="mm")
    
    # Divider inside card
    draw.line([(x_center - 150, cy1 + 380), (x_center + 150, cy1 + 380)], fill="#F1F5F9", width=3)
    
    # Description lines
    f_cdesc = get_font(31, bold=False)
    lines = col["desc"].split("\n")
    cur_y = cy1 + 430
    for line in lines:
        draw.text((x_center, cur_y), line, font=f_cdesc, fill="#334155", anchor="mm")
        cur_y += 46
        
    # Card Button Pill at bottom
    cbtn_w, cbtn_h = 520, 92
    cbx = x_center - cbtn_w // 2
    cby = cy2 - 120
    draw.rounded_rectangle([cbx, cby, cbx + cbtn_w, cby + cbtn_h], radius=46, fill=col["btn_bg"])
    f_cbtn = get_font(38, bold=True)
    draw.text((x_center, cby + 46), col["btn_text"], font=f_cbtn, fill="#FFFFFF", anchor="mm")

# Save final image
out_dir = r"C:\Website and line OA"
out_path = os.path.join(out_dir, "rich_menu.png")
img.save(out_path, "PNG", quality=95)
print(f"Rich Menu image successfully updated at: {out_path} ({img.width}x{img.height})")
