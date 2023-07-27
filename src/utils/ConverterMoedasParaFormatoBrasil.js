
export default function MoedaFormatada(moeda) {
     const valorFormatado = Intl.NumberFormat('pt-br', {style: 'currency', currency: 'BRL'}).format(moeda)
     return valorFormatado
}