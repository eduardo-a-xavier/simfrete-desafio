const fs = require('fs')

function parseCidades(secao) {
  return secao.trim().split(/\r?\n/).filter(linha => linha.trim() !== '').map(linha => {
    const [nome, min, max] = linha.trim().split(',')
    return { nome: nome.trim(), min: parseInt(min, 10), max: parseInt(max, 10) }
  })
}

function parseGrafo(secao) {
  const grafo = {}

  for (const linha of secao.trim().split(/\r?\n/)) {
    if (!linha.trim()) continue

    const [de, para, custo] = linha.trim().split(',')
    const valor = parseFloat(custo)

    if (!grafo[de]) {
      grafo[de] = {}
    }

    if (!grafo[para]) {
      grafo[para] = {}
    }

    if (grafo[de][para] === undefined) {
      grafo[de][para] = valor
      grafo[para][de] = valor
    } else if (valor < grafo[de][para]) {
      grafo[de][para] = valor
      grafo[para][de] = valor
    }
  }

  return grafo
}

function cidadeDoCep(cidades, cep) {
  const cidade = cidades.find(c => cep >= c.min && cep <= c.max)

  if (!cidade) {
    return null
  }

  return cidade.nome
}

function dijkstra(grafo, origem, destino) {
  const dist = {}
  const anterior = {}
  const visitados = new Set()

  for (const cidade of Object.keys(grafo)) dist[cidade] = Infinity
  dist[origem] = 0

  while (true) {
    let atual = null

    for (const cidade of Object.keys(dist)) {
      if (visitados.has(cidade)) continue
      if (atual === null || dist[cidade] < dist[atual]) {
        atual = cidade
      }
    }

    if (!atual || dist[atual] === Infinity || atual === destino) break
    visitados.add(atual)

    for (const [vizinho, custo] of Object.entries(grafo[atual])) {
      const novaDist = dist[atual] + custo
      if (novaDist < dist[vizinho]) {
        dist[vizinho] = novaDist
        anterior[vizinho] = atual
      }
    }
  }

  const caminho = []
  let cidade = destino

  while (cidade) {
    caminho.unshift(cidade)
    cidade = anterior[cidade]
  }

  return { caminho, custo: dist[destino] }
}

function main() {
  const conteudo = fs.readFileSync('rota.txt', 'utf-8')

  const partes = conteudo.split('--')
  const secCidades = partes[0]
  const secRotas = partes[1]
  const secCeps = partes[2]

  const cidades = parseCidades(secCidades)
  const grafo = parseGrafo(secRotas)

  const cepsParts = secCeps.trim().split(',')
  const cep1 = parseInt(cepsParts[0], 10)
  const cep2 = parseInt(cepsParts[1], 10)

  const origem = cidadeDoCep(cidades, cep1)
  const destino = cidadeDoCep(cidades, cep2)

  if (!origem || !destino) {
    console.log('Cidade não encontrada')
    return
  }

  const resultado = dijkstra(grafo, origem, destino)
  const caminho = resultado.caminho
  const custo = resultado.custo

  if (custo === undefined || custo === Infinity) {
    console.log('Caminho não encontrado')
    return
  }

  console.log(caminho.join(' -> '))
  console.log(`Custo: ${custo.toFixed(2)}`)
}

main()
