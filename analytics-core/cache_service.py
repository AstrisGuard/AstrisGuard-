from collections import deque
from typing import Any, Optional, List


class ResultCache:
    def __init__(self, max_size: int = 10):
        self.cache = deque(maxlen=max_size)
        self._index = {}  # хранение по ключу

    def add_result(self, result: Any, key: Optional[str] = None) -> None:
        """Добавить результат в кэш с опциональным ключом"""
        self.cache.append(result)
        if key is not None:
            self._index[key] = result

    def get_latest(self, n: Optional[int] = None) -> List[Any]:
        """Вернуть последние n результатов (или все, если n не указано)"""
        if n is None or n > len(self.cache):
            return list(self.cache)
        return list(self.cache)[-n:]

    def get_by_key(self, key: str) -> Optional[Any]:
        """Достать результат по ключу"""
        return self._index.get(key)

    def get_last(self) -> Optional[Any]:
        """Вернуть последний элемент или None, если кэш пуст"""
        return self.cache[-1] if self.cache else None

    def clear(self) -> None:
        """Очистить кэш и индекс"""
        self.cache.clear()
        self._index.clear()
