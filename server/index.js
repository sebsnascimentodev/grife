import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import produtosRouter from './routes/produtos.js';
import cuponsRouter from './routes/cupons.js';
import envioRouter from './routes/envio.js';
import pedidosRouter from './routes/pedidos.js';
import adminRouter from './routes/admin.js';
import pagamentoRouter from './routes/pagamento.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/produtos', produtosRouter);
app.use('/api/cupons', cuponsRouter);
app.use('/api/envio', envioRouter);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/admin', adminRouter);
app.use('/api/pagamento', pagamentoRouter);

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`GRIFE. API rodando em http://localhost:${PORT}`);
});
