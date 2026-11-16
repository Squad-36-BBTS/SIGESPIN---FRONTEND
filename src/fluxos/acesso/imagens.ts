// Fotografias reais do Unsplash (licença Unsplash: uso livre, inclusive comercial).
// Para produção, baixe-as para /public/img ou substitua por fotos institucionais da BBTS.
const unsplash = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const IMAGENS = {
  hero: unsplash('photo-1522071820081-009f0129c71c', 1400), // equipe colaborando em notebooks
  ideia: unsplash('photo-1552664730-d307ca884978', 900), // quadro com post-its
  analise: unsplash('photo-1551288049-bebda4e38f71', 900), // painel de indicadores
  comite: unsplash('photo-1600880292203-757bb62b4baf', 900), // reunião de decisão
  acompanhamento: unsplash('photo-1460925895917-afdab827c52f', 900), // análise em notebook
  perfilDemandante: unsplash('photo-1573496359142-b8d87734a5a2', 600),
  perfilAnalista: unsplash('photo-1519085360753-af0119f7cbe7', 600),
  perfilEspecialista: unsplash('photo-1556761175-5973dc0f32e7', 600),
  login: unsplash('photo-1497366216548-37526070297c', 1400), // escritório corporativo
  cadastro: unsplash('photo-1531482615713-2afd69097998', 1400), // equipe em computadores
};
