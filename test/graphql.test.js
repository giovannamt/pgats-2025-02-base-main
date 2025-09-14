const request = require("supertest");
const { expect } = require("chai");
const app = require("../graphql/app");

describe("API GraphQL", () => {
  let token;
  let userEmail;

  before(() => {
    userEmail = `testeuser+${Date.now()}@email.com`;
  });

  it("deve registrar um usuário via GraphQL", async () => {
    const query = `
      mutation Register($name: String!, $email: String!, $password: String!) {
        register(name: $name, email: $email, password: $password) {
          name
          email
        }
      }
    `;

    const variables = { name: "Teste GraphQL", email: userEmail, password: "senha123" };
    const res = await request(app).post("/graphql").send({ query, variables });

    expect(res.status).to.equal(200);
    expect(res.body.data.register).to.have.property("email", userEmail);
    expect(res.body.data.register).to.have.property("name", "Teste GraphQL");
  });

  it("deve logar via GraphQL e retornar token", async () => {
    const query = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
        }
      }
    `;

    const variables = { email: userEmail, password: "senha123" };
    const res = await request(app).post("/graphql").send({ query, variables });

    expect(res.status).to.equal(200);
    expect(res.body.data.login).to.have.property("token");
    token = res.body.data.login.token;
  });

  it("deve realizar checkout com boleto via GraphQL", async () => {
    const query = `
      mutation Checkout($items: [CheckoutItemInput!]!, $freight: Float!, $paymentMethod: String!) {
        checkout(items: $items, freight: $freight, paymentMethod: $paymentMethod) {
          valorFinal
          paymentMethod
          items { productId quantity }
        }
      }
    `;

    const variables = { items: [{ productId: 1, quantity: 2 }], freight: 20, paymentMethod: "boleto" };
    const res = await request(app).post("/graphql").set("Authorization", `Bearer ${token}`).send({ query, variables });

    expect(res.status).to.equal(200);
    expect(res.body.data.checkout).to.have.property("valorFinal");
    expect(res.body.data.checkout).to.have.property("paymentMethod", "boleto");
    expect(res.body.data.checkout.items).to.be.an("array");
  });

  it("deve realizar checkout com cartão de crédito via GraphQL", async () => {
    const query = `
      mutation Checkout($items: [CheckoutItemInput!]!, $freight: Float!, $paymentMethod: String!, $cardData: CardDataInput) {
        checkout(items: $items, freight: $freight, paymentMethod: $paymentMethod, cardData: $cardData) {
          valorFinal
          paymentMethod
          items { productId quantity }
        }
      }
    `;

    const variables = {
      items: [{ productId: 2, quantity: 1 }],
      freight: 15,
      paymentMethod: "credit_card",
      cardData: { number: "4111111111111111", name: "Teste GraphQL", expiry: "12/30", cvv: "123" }
    };

    const res = await request(app).post("/graphql").set("Authorization", `Bearer ${token}`).send({ query, variables });

    expect(res.status).to.equal(200);
    expect(res.body.data.checkout).to.have.property("valorFinal");
    expect(res.body.data.checkout).to.have.property("paymentMethod", "credit_card");
    expect(res.body.data.checkout.items).to.be.an("array");
  });
});
