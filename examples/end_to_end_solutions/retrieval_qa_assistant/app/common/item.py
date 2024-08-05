from typing import Optional, List
from dataclasses import dataclass, field
from app.common.log import log
import sqlite3
import mysql.connector


@dataclass
class Metadata:
    id: Optional[str] = field(default=None)
    title: Optional[str] = field(default=None)
    update_time: Optional[str] = field(default=None)
    doc_id: Optional[str] = field(default=None)
    local_path: Optional[str] = field(default=None)
    remote_url: Optional[str] = field(default=None)


class MysqlManager:
    def __init__(self, host: str, user: str, password: str, database: str):
        self.conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        self.cursor = self.conn.cursor()

    def __delete__(self):
        self.cursor.close()
        self.conn.close()

    def create_table(self):
        self.cursor.execute('''
            CREATE TABLE IF NOT EXISTS items (
                id VARCHAR(64) PRIMARY KEY,
                update_time TEXT NOT NULL,
                doc_id TEXT NOT NULL
            )
        ''')
        self.conn.commit()

    def destroy_table(self):
        self.cursor.execute('''
            DROP TABLE IF EXISTS items
            ''')
        self.conn.commit()

    def add(self, item: Metadata):
        try:
            self.cursor.execute('''
            INSERT INTO items (id, update_time, doc_id)
            VALUES (%s, %s, %s)
            ''', (item.id, item.update_time, item.doc_id))
            self.conn.commit()
        except Exception:
            log.warning("item with id %s already exists" % item.id)

    def update(self, item: Metadata):
        self.cursor.execute('''
            UPDATE items
            SET update_time = %s, doc_id = %s
            WHERE id = %s
            ''', (item.update_time, item.doc_id, item.id))
        self.conn.commit()

    def delete(self, item_id):
        self.cursor.execute('''
        DELETE FROM items
        WHERE id = %s
        ''', (item_id,))
        self.conn.commit()

    def get(self, item_id) -> Optional[Metadata]:
        try:
            self.cursor.execute('''
            SELECT * FROM items WHERE id = %s
            ''', (item_id,))
            row = self.cursor.fetchone()
        except Exception as e:
            log.warning("get item_id failed: %s" % e)
            return None

        if row:
            return Metadata(id=row[0], update_time=row[1], doc_id=row[2])
        else:
            return None

    def get_all(self) -> List[Metadata]:
        try:
            self.cursor.execute('SELECT * FROM items')
            rows = self.cursor.fetchall()
        except Exception as e:
            log.warning("get all items failed: %s" % e)
            return None

        return [Metadata(id=row[0], update_time=row[1], doc_id=row[2]) for row in rows]


class SqliteManager:
    def __init__(self, path: str):
        self.conn = sqlite3.connect(path, check_same_thread=False)
        self.cursor = self.conn.cursor()

    def __delete__(self):
        self.cursor.close()
        self.conn.close()

    def create_table(self):
        self.cursor.execute('''
        CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            update_time TEXT NOT NULL,
            doc_id TEXT NOT NULL
        )
        ''')
        self.conn.commit()

    def destroy_table(self):
        self.cursor.execute('''
        DROP TABLE IF EXISTS items
        ''')
        self.conn.commit()

    def add(self, item: Metadata):
        try:
            self.cursor.execute('''
            INSERT INTO items (id, update_time, doc_id)
            VALUES (?, ?, ?)
            ''', (item.id, item.update_time, item.doc_id))
            self.conn.commit()
        except sqlite3.IntegrityError:
            log.warning("item with id %s already exists" % item.id)

    def update(self, item: Metadata):
        self.cursor.execute('''
        UPDATE items
        SET update_time = ?, doc_id = ?
        WHERE id = ?
        ''', (item.update_time, item.doc_id, item.id))
        self.conn.commit()

    def delete(self, item_id):
        self.cursor.execute('''
        DELETE FROM items
        WHERE id = ?
        ''', (item_id,))
        self.conn.commit()

    def get(self, item_id) -> Optional[Metadata]:
        try:
            self.cursor.execute('''
            SELECT * FROM items WHERE id = ?
            ''', (item_id,))
            row = self.cursor.fetchone()
        except sqlite3.OperationalError as e:
            log.warning("get item_id failed: %s" % e)
            return None

        if row:
            return Metadata(id=row[0], update_time=row[1], doc_id=row[2])
        else:
            return None

    def get_all(self) -> List[Metadata]:
        try:
            self.cursor.execute('SELECT * FROM items')
            rows = self.cursor.fetchall()
        except sqlite3.OperationalError as e:
            log.warning("get all items failed: %s" % e)
            return None

        return [Metadata(id=row[0], update_time=row[1], doc_id=row[2]) for row in rows]