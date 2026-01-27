# python -m venv venv 
# source venv/activate.fish (for fish terminal) 
# restart terminal 
# pip install faker psycopg2-binary python-dotenv
import random
from faker import Faker
import psycopg2
from dotenv import dotenv_values
from datetime import datetime, timedelta

fake = Faker()
config = dotenv_values("../.env")

conn = psycopg2.connect(
    host=config["PGHOST"],
    user=config["PGUSER"],
    password=config["PGPASSWORD"],
    database=config["PGDATABASE"]
)
cur = conn.cursor()

def q(sql, params=None, fetch=False):
    cur.execute(sql, params)
    conn.commit()
    if fetch:
        return cur.fetchone()[0]

cur.execute("SET session_replication_role = replica;")

# ------------------------------------------------
# CONSTANTS
# ------------------------------------------------
USERS = 60
COMPANIES = 12
CATEGORIES = 5
PRODUCTS = 220
VARIANTS_PER_PRODUCT = (2, 5)
TAGS = 25
ORDERS = 160
ADDRESSES = 20
IMAGES = 120
DISCOUNTS = 10

# ------------------------------------------------
# SYSTEM ADMIN
# ------------------------------------------------
admin_id = q("""
    INSERT INTO tbl_users (email, password_hash, access_type)
    VALUES (%s,%s,%s) RETURNING id
""", ("admin@system.local", fake.sha256(), 9), True)

# ------------------------------------------------
# CATEGORIES
# ------------------------------------------------
categories_ids = []
for _ in range(CATEGORIES):
    categories_ids.append(
            q("""
            INSERT INTO tbl_categories
            (name, created_by)
            VALUES (%s,%s) RETURNING id
        """, (
            fake.word().title(),
            admin_id
        ), True)
    )

# ------------------------------------------------
# USERS
# ------------------------------------------------
user_ids = [admin_id]

for _ in range(USERS):
    uid = q("""
        INSERT INTO tbl_users
        (email, phone_no, password_hash, created_by)
        VALUES (%s,%s,%s,%s) RETURNING id
    """, (
        fake.unique.email(),
        fake.msisdn()[:11],
        fake.sha256(),
        admin_id
    ), True)
    user_ids.append(uid)

# ------------------------------------------------
# IMAGES
# ------------------------------------------------
image_ids = []
for _ in range(IMAGES):
    image_ids.append(
        q("""
            INSERT INTO tbl_images (image_url, created_by)
            VALUES (%s,%s) RETURNING id
        """, (
            fake.image_url(),
            admin_id
        ), True)
    )

# ------------------------------------------------
# ADDRESSES
# ------------------------------------------------
address_ids = []
for _ in range(ADDRESSES):
    address_ids.append(
        q("""
            INSERT INTO tbl_addresses
            (address_name, address_details, created_by)
            VALUES (%s,%s,%s) RETURNING id
        """, (
            # fake.city(),
	    	random.choice(["WORK", "HOME"]),
            fake.address(),
            admin_id
        ), True)
    )

# ------------------------------------------------
# USER DETAILS
# ------------------------------------------------
for uid in user_ids:
    q("""
        INSERT INTO tbl_users_details
        (users_id, first_name, last_name, images_id, addresses_id, created_by)
        VALUES (%s,%s,%s,%s,%s,%s)
    """, (
        uid,
        fake.first_name(),
        fake.last_name(),
        random.choice(image_ids),
        random.choice(address_ids),
        admin_id
    ))

# ------------------------------------------------
# COMPANIES
# ------------------------------------------------
company_ids = []
for _ in range(COMPANIES):
    company_ids.append(
        q("""
            INSERT INTO tbl_companies (name, created_by)
            VALUES (%s,%s) RETURNING id
        """, (
            fake.unique.company(),
            admin_id
        ), True)
    )

# ------------------------------------------------
# TAGS
# ------------------------------------------------
tag_ids = []
for _ in range(TAGS):
    tag_ids.append(
        q("""
            INSERT INTO tbl_tags (name, created_by)
            VALUES (%s,%s) RETURNING id
        """, (
            fake.unique.word(),
            admin_id
        ), True)
    )

# ------------------------------------------------
# PRODUCTS
# ------------------------------------------------
product_ids = []

for _ in range(PRODUCTS):
    pid = q("""
        INSERT INTO tbl_products
        (name, companies_id, categories_id, price, details, ingredients, instructions, images_id, created_by)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        RETURNING id
    """, (
        fake.catch_phrase(),
        random.choice(company_ids),
        random.choice(categories_ids),
        round(random.uniform(5, 180), 2),
        fake.text(200),
        fake.text(120),
        fake.text(150),
        random.choice(image_ids),
        admin_id
    ), True)

    product_ids.append(pid)

    for tag in random.sample(tag_ids, random.randint(1, 4)):
        q("""
            INSERT INTO tbl_products_tags_bridge (products_id, tags_id)
            VALUES (%s,%s)
        """, (pid, tag))

# ------------------------------------------------
# PRODUCT VARIANTS
# ------------------------------------------------
variant_ids = []

for pid in product_ids:
    for _ in range(random.randint(*VARIANTS_PER_PRODUCT)):
        vid = q("""
            INSERT INTO tbl_products_variants
            (products_id, color_code, images_id, created_by)
            VALUES (%s,%s,%s,%s) RETURNING id
        """, (
            pid,
            fake.hex_color()[1:],
            random.choice(image_ids),
            admin_id
        ), True)
        variant_ids.append(vid)

# ------------------------------------------------
# VARIANT STOCKS
# ------------------------------------------------
for vid in variant_ids:
    q("""
        INSERT INTO tbl_products_variants_stocks
        (sku, products_variants_id, qty, price, addresses_id, created_by)
        VALUES (%s,%s,%s,%s,%s,%s)
    """, (
        fake.unique.bothify("SKU#####"),
        vid,
        random.randint(0, 80),
        round(random.uniform(10, 250), 2),
        random.choice(address_ids),
        admin_id
    ))

# ------------------------------------------------
# DISCOUNTS
# ------------------------------------------------
discount_ids = []
for _ in range(DISCOUNTS):
    discount_ids.append(
        q("""
            INSERT INTO tbl_discounts
            (name, code, percent_off, created_by)
            VALUES (%s,%s,%s,%s) RETURNING id
        """, (
            fake.word().title(),
            fake.unique.lexify("SAVE??"),
            random.choice([10, 15, 20, 25, None]),
            admin_id
        ), True)
    )

# ------------------------------------------------
# ORDERS
# ------------------------------------------------
order_ids = []
for _ in range(ORDERS):
    oid = q("""
        INSERT INTO tbl_orders
        (users_id, cart_total, discounts_id, created_by)
        VALUES (%s,%s,%s,%s) RETURNING id
    """, (
        random.choice(user_ids),
        round(random.uniform(20, 500), 2),
        random.choice(discount_ids + [None]),
        admin_id
    ), True)

    order_ids.append(oid)

    for _ in range(random.randint(1, 4)):
        q("""
            INSERT INTO tbl_orders_products_bridge
            (orders_id, products_variants_id, created_by)
            VALUES (%s,%s,%s)
        """, (
            oid,
            random.choice(variant_ids),
            admin_id
        ))

cur.execute("SET session_replication_role = origin;")
cur.close()
conn.close()

print("✅ Database seeded successfully")