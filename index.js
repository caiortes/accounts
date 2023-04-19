// modulos externos
const chalk = require("chalk");
const inquirer = require("inquirer");

// modulos internos
const fs = require("fs");
const { findSourceMap } = require("module");

operation();

function operation() {
  inquirer // blibioteca que fornece uma interface de linha de comando /  fornece a interface do usuário e o fluxo da sessão de consulta
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer",
        choices: [
          "Criar Conta",
          "Consultar Saldo",
          "Depositar",
          "Sacar",
          "Remover Conta",
          "Sair",
        ],
      },
    ])
    .then((answser) => {
      const action = answser["action"]; // mostra qual o input o usuário escolheu

      if (action === "Criar Conta") {
        createAccount();
      } else if (action === "Consultar Saldo") {
        getAccountBalance();
      } else if (action === "Depositar") {
        deposit();
      } else if (action === "Sacar") {
        withdraw();
      } else if (action === "Remover Conta") {
        remove();
      } else if (action === "Sair") {
        console.log(chalk.bgBlue.black("Obrigado por usar o Accounts!"));
        process.exit();
      }
    })
    .catch((err) => console.log(err));
}

// creat an account
function createAccount() {
  console.log(chalk.bgGreen.black("Parabéns por escolher o nosso banco!"));
  console.log(chalk.green("Defina as opções da sua conta a seguir"));

  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite um nome para a sua conta:",
      },
    ])
    .then((answser) => {
      const accountName = answser["accountName"];

      console.info(accountName);

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }
      //validação
      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black("Está conta já existe, escolha outro nome!")
        );
        buildAccount();
        return;
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance": 0}',
        (err) => {
          console.log(err);
        }
      );
      console.log(chalk.green("Parabéns, a sua conta foi criada"));
      operation();
    })
    .catch((err) => console.log(err));
}

// add an amount to user account
function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answser) => {
      const accountName = answser["accountName"];

      // verify if account exists
      if (!checkAccount(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja depositar?",
          },
        ])
        .then((answser) => {
          const amount = answser["amount"];

          // add an amount
          addAmount(accountName, amount);
          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(
      chalk.bgRed.black("Está conta não existe, escolha outro nome!")
    );
    return false;
  }
  return true;
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
    );
    return deposit();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance); //parseFloat = transforma uma string em um número

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData), // transformando o objeto JS em um JSON stringy.
    (err) => {
      console.log(err);
    }
  );
  console.log(
    chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`)
  );
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf-8",
    flag: "r", // informa que só queremos ler o arquivo
  });

  return JSON.parse(accountJSON);
}

// show account balance
function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answser) => {
      const accountName = answser["accountName"];

      // verify if account exists
      if (!checkAccount(accountName)) {
        return getAccountBalance();
      }

      const accountData = getAccount(accountName);

      console.log(
        chalk.bgBlue.black(
          `Olá, o saldo da sua conta é de R$${accountData.balance} reais!!`
        )
      );
      operation();
    })
    .catch((err) => console.log(err));
}

// get money from account
function withdraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answser) => {
      const accountName = answser["accountName"];

      // verify if account exists
      if (!checkAccount(accountName)) {
        return withdraw();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja sacar?",
          },
        ])
        .then((answser) => {
          const amount = answser["amount"];

          removeAmount(accountName, amount);
          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
    );
    return withdraw();
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black("Valor indisponível!"));
    return withdraw();
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (err) => {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`)
  );
}

function remove() {
  inquirer
    .prompt([
      {
        name: "removeAccount",
        message: "Qual conta deseja excluir?",
      },
    ])
    .then((answser) => {
      const accountName = answser["removeAccount"];

      if (!checkAccount(accountName)) {
        return remove();
      }

      removeAccount(accountName);
    })
    .catch((err) => console.log(err));
}

function removeAccount(accountName) {
  const accountData = getAccount(accountName);

  fs.unlink(`accounts/${accountName}.json`, (err) => console.log(err));

  operation();
}
