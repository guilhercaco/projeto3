const formEndereco = document.getElementById("formEndereco");

formEndereco.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id_cliente = localStorage.getItem("id_cliente");

    if (!id_cliente) {
        alert("Faça login antes de cadastrar seu endereço.");
        window.location.href = "../html/conta.html";
        return;
    }

    const cep = document.getElementById("cep").value.trim();
    const rua = document.getElementById("rua").value.trim();
    const complemento = document
        .getElementById("complemento")
        .value.trim();

    if (!cep || !rua) {
        alert("Preencha o CEP e a rua.");
        return;
    }

    try {
        const resposta = await fetch("http://localhost:3000/endereco", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id_cliente,
                cep,
                rua,
                complemento
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.mensagem || "Erro ao salvar o endereço.");
            return;
        }

        alert(dados.mensagem);
        formEndereco.reset();

    } catch (erro) {
        console.error("Erro:", erro);
        alert("Não foi possível conectar ao servidor.");
    }
});