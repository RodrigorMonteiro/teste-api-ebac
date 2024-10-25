/// <reference types="cypress" />
import contrato from '../contracts/usuarios.contract'
import { faker, Faker } from '@faker-js/faker';

describe('Testes da Funcionalidade Usuários', () => {
  const skipBefore = false;
  let token
    before(() => {
      if (!skipBefore) {
        cy.token('fulano@qa.com', 'teste').then(tkn => { token = tkn })
      }
    });

  it('Deve validar contrato de usuários', () => {
    cy.request('usuarios').then(response => {
      return contrato.validateAsync(response.body)
  })
  });

  it('Deve listar usuários cadastrados', () => {
     cy.request({
            method: 'GET',
            url:'usuarios'
        }).should((response) => {
            expect(response.status).equal(200)
            expect(response.body).to.have.property('usuarios')
        })
  });

  it('Deve cadastrar um usuário com sucesso', () => {
    let usuario = faker.person.firstName() + faker.person.lastName()
    let usuarioEmail = usuario + '@teste.com.br'
    let usuarioPassword = faker.internet.password()
        cy.cadastrarUsuario(usuario, usuarioEmail, usuarioPassword, 'true')
        .should((response) => {
            expect(response.status).equal(201)
            expect(response.body.message).equal('Cadastro realizado com sucesso')
        })
  });

  it('Deve validar um usuário com email inválido', () => {
    cy.request({
      method: 'POST',
      url: 'login',
      body: {
          "email": "errodoerro@qa.com",
          "password": "teste" 
      },
      failOnStatusCode: false
  }).then((response) => {
      expect(response.status).to.equal(401)
      expect(response.body.message).to.equal('Email e/ou senha inválidos')
      cy.log(response.body.authorization)
  })

  });

  it('Deve editar um usuário previamente cadastrado', () => {
    let usuario = faker.person.firstName() + faker.person.lastName()
    let usuarioEmail = usuario + '@teste.com.br'
    let usuarioPassword = faker.internet.password()
        cy.cadastrarUsuario(usuario, usuarioEmail, usuarioPassword, 'true')
        .then(response => {
            let idUsuario = response.body._id
            cy.request({
                method: 'PUT',
                url: `usuarios/${idUsuario}`,
                headers: {authorization: token},
                body: {
                    "nome": usuario,
                    "email": usuarioEmail,
                    "password": "senhaeditada123",
                    "administrador": 'true'
                  }
            }).should((response) => {
                expect(response.status).equal(200)
                expect(response.body.message).equal('Registro alterado com sucesso')
            })
        })
  });

  it('Deve deletar um usuário previamente cadastrado', () => {
    cy.cadastrarUsuario('usuariodeletar', 'usuariodeletar123@teste.com', 'passworddeletar', 'true')
        .then(response => {
          let idUsuario = response.body._id
            cy.request({
                method: 'DELETE',
                url: `usuarios/${idUsuario}`,
                headers: {authorization: token},
            }).should((response) => {
                expect(response.status).equal(200)
                expect(response.body.message).equal('Registro excluído com sucesso')
            })
        }) 
  });


});
