require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  }
}));

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({
      error: "Debes iniciar sesión"
    });
  }
  next();
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      client: "Freund",
      runtime: "Node.js",
      database: "PostgreSQL",
      databaseConnection: "connected"
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      databaseConnection: "disconnected"
    });
  }
});






app.post("/api/login", async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({
        error: "Completa todos los campos"
      });
    }

    const result = await pool.query(
      "SELECT id, usuario, password_hash FROM usuarios WHERE usuario = $1",
      [usuario]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Credenciales incorrectas"
      });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({
        error: "Credenciales incorrectas"
      });
    }

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ error: "Error de sesión" });
      }
      req.session.userId = user.id;
      req.session.usuario = user.usuario;
      res.json({ mensaje: "Login exitoso" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno" });
  }
});

app.get("/api/session", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ authenticated: false });
  }

  res.json({
    authenticated: true,
    usuario: req.session.usuario
  });
});

app.get("/api/productos", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre, precio FROM productos ORDER BY id"
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error de base de datos" });
  }
});

app.post("/api/productos", requireAuth, async (req, res) => {
  try {
    const nombre = String(req.body.nombre || "").trim();
    const precio = Number(req.body.precio);

    if (!nombre || nombre.length > 150 ||
        !Number.isFinite(precio) || precio < 0 ||
        req.body.precio === undefined || req.body.precio === "") {
      return res.status(400).json({
        error: "Nombre o precio inválido"
      });
    }

    const result = await pool.query(
      "INSERT INTO productos(nombre, precio) VALUES($1, $2) RETURNING *",
      [nombre, precio]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo guardar el producto" });
  }
});


app.put("/api/productos/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const nombre = String(req.body.nombre || "").trim();
    const precio = Number(req.body.precio);

    if (
      !Number.isSafeInteger(id) || id <= 0 ||
      !nombre || nombre.length > 150 ||
      req.body.precio === undefined ||
      req.body.precio === null ||
      req.body.precio === "" ||
      !Number.isFinite(precio) || precio < 0
    ) {
      return res.status(400).json({
        error: "Datos del producto inválidos"
      });
    }

    const result = await pool.query(
      `UPDATE productos
       SET nombre = $1, precio = $2
       WHERE id = $3
       RETURNING id, nombre, precio`,
      [nombre, precio, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Producto no encontrado"
      });
    }

    res.json({
      mensaje: "Producto actualizado correctamente",
      producto: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo actualizar el producto"
    });
  }
});





app.delete("/api/productos/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "ID de producto inválido"
      });
    }

    const result = await pool.query(
      "DELETE FROM productos WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Producto no encontrado"
      });
    }

    res.json({
      mensaje: "Producto eliminado correctamente",
      id: result.rows[0].id
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "No se pudo eliminar el producto"
    });
  }
});










app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ mensaje: "Sesión cerrada" });
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Freund Node.js escuchando en puerto ${PORT}`);
});
