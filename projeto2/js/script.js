const botao = document.getElementById("botao");

botao.addEventListener("click", async () => {

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const nome = document.getElementById("nome").value;
    const cep = document.getElementById("cep").value;

    try {

        const resposta = await fetch("http://localhost:3000/cadastrar", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                senha: senha,
                nome: nome,
                cep: cep
            })
        });

        const resultado = await resposta.json();

        if (resposta.ok) {

            alert("Conta criada com sucesso!");

            window.location.href = "index.html";

        } else {

            alert(resultado.mensagem);

        }

    } catch (erro) {

        console.error(erro);

        alert("Erro ao conectar com o servidor.");

    }

});