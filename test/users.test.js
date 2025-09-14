const request = require("supertest");
const { expect } = require("chai");
const app = require("../rest/app");

describe("API REST - Users", () => {

  describe("POST /api/users/register", () => {
    it("deve registrar um novo usuário com sucesso", async () => {
      const email = `testeuser+${Date.now()}@email.com`; // email único
      const res = await request(app)
        .post("/api/users/register")
        .send({
          name: "Teste Usuário",
          email,
          password: "senha123"
        });

      expect(res.status).to.equal(201); // status correto
      expect(res.body).to.have.property("user");
      expect(res.body.user).to.have.property("email", email);
      expect(res.body.user).to.have.property("name", "Teste Usuário");
    });
  });

  describe("POST /api/users/login", () => {
    it("deve logar e retornar um token JWT", async () => {
      // Vamos usar um usuário que já existe na memória
      const res = await request(app)
        .post("/api/users/login")
        .send({
          email: "alice@email.com",
          password: "123456"
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("token");
    });
  });

});
