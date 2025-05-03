## How to Deploy

### Backend

Navigate to `/backend` and run:

```sh
npm install
docker compose up --build
```

For accessing admin dashboard, navigate to [http://SERVERADDRESS:7351](http://localhost:7351)


Default admin credentials:  
- Username: `admin`  
- Password: `password`


### Frontend

Navigate to `/frontend` and run:

```sh
yarn install

yarn run dev
```

Then, in your browser, navigate to [http://localhost:5173](http://localhost:5173)

---

## Reference

- [Nakama: Getting Started with Docker](https://heroiclabs.com/docs/nakama/getting-started/install/docker/)
- [Nakama JavaScript Client Libraries](https://heroiclabs.com/docs/nakama/client-libraries/javascript)
- [Phaser API Documentation](https://docs.phaser.io/api-documentation/api-documentation)
- [Phaser 3 Game Tutorial (Part 1)](https://phaser.io/tutorials/making-your-first-phaser-3-game/part1)
- [YouTube: Phaser Apple Catcher Starter](https://youtu.be/0qtg-9M3peI?si=SBqQC-xTRPX_0CdP)
- [GitHub: Phaser Apple Catcher Starter](https://github.com/digitaldeja0/Phaser-Apple-Catcher-Starter)

https://github.com/finepointcgi/Nakama-Integration-Tutorial 
https://www.youtube.com/watch?v=gU6gIIMYmDM
https://www.youtube.com/watch?v=FXguREV6Zf8

---

- **7349:** Nakama gRPC port (not typically used by web clients)
- **7350:** Nakama default HTTP/WS port (used by web/Phaser clients)
- **7351:** Nakama console (admin UI)
