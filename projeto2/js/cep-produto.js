document.addEventListener("DOMContentLoaded", async () => {
    const elementoCep = document.getElementById("cepCliente");

    if (!elementoCep) return;

    const idCliente = localStorage.getItem("id_cliente");

    if (!idCliente) {
        elementoCep.textContent = "CEP: faça login para consultar";
        return;
    }

    try {
        const resposta = await fetch(
            `http://localhost:3000/cliente/${encodeURIComponent(idCliente)}/cep`
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.erro || "Erro ao buscar CEP");
        }

        if (dados.cep) {
            const cep = String(dados.cep).replace(
                /^(\d{5})(\d{3})$/,
                "$1-$2"
            );

            elementoCep.textContent = `CEP: ${cep}`;
        } else {
            elementoCep.textContent = "CEP: não cadastrado";
        }

    } catch (erro) {
        console.error("Erro ao carregar CEP:", erro);
        elementoCep.textContent = "CEP: erro ao carregar";
    }
});
