![Эвум](public/Aevum-1.png)
# Aevun
Messanger prototype

#### Beyond time. Beyond loss

### Миссия
Создать цифровое пространство для общения со связями, которое уважает вашу историю, защищает ваши данные, рассчитанные на долгие годы хранения.

### Целевая аудитория:
- Люди, ищущие "анти-дискорд" – место для вдумчивых, долгих бесед.
- Те, кто крайне озабочен конфиденциальностью и сохранностью данных.
- И те, кто хотят иметь "ВневременнОй архив" поиска по всей истории диалогов, создание "капсул времени" из сообщений, экспорт бесед в вечные форматы.

### Спецификация
- Front: Vue3, Composition APi, pinia,
- Back (alef):  Nest 11, TypeORM (?), Postgress
- Connect: WebSocket, Rest
- Crypto: Signal Protocol + TLS 1.3

### Todo list
- [ ] Аутентификация JWT
    - [x] authStore
        - [x] getAccessToken
        - [x] getProfile
    - [ ] composible
        - [x] useAuth
    - [x] authLogin.vue
    - [ ] проверка сообщений
- [ ] MesSendo
    - [ ] composible
        - [x] useWebsoket
        - [ ] useOperTools
    - [ ] MesSendo.vue
        - [ ] концепция стилей scss
        - [ ] Форма и сервис
            - [ ] панель участников с выбором кабинета
            - [ ] структура сообщений
                - [ ] в кабинете,
                - [ ] иерархия сообщений,
                - [ ] иконки, цвета
                - [ ] кабинетное оглавление по времени и тегам
                - [ ] Ссылочная система
            - [ ] личные закладки
        - [ ] MesSaver
            - [ ] капсулы и экспорт
        - [ ] MesFind
            - [ ] поисковые теги
- [ ] MesCripto
    - [ ] Signal Protocol (Double Ratchet)
    - [ ] TLS 1.3