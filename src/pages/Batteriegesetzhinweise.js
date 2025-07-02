import React from 'react';
import { Typography } from '@mui/material';
import LegalPage from './LegalPage.js';

const Batteriegesetzhinweise = () => {
  const content = (
    <>
      <Typography variant="body1" paragraph>
        Im Zusammenhang mit dem Vertrieb von Batterien oder mit der Lieferung von Geräten, die Batterien enthalten, sind wir verpflichtet, Sie auf folgendes hinzuweisen:
      </Typography>
      
      <Typography variant="body1" paragraph>
        Sie sind zur Rückgabe gebrauchter Batterien als Endnutzer gesetzlich verpflichtet. Sie können Altbatterien, die wir als Neubatterien im Sortiment führen oder geführt haben, unentgeltlich an unserem Versandlager (Versandadresse) zurückgeben.
      </Typography>
      
      <Typography variant="body1" paragraph>
        Die auf den Batterien abgebildeten Symbole haben folgende Bedeutung:
      </Typography>
      
      <Typography variant="body1" paragraph>
        Das Symbol der durchgekreuzten Mülltonne bedeutet, dass die Batterie nicht in den Hausmüll gegeben werden darf.
      </Typography>
      
      <Typography variant="body1" sx={{ ml: 2 }} paragraph>
        Pb = Batterie enthält mehr als 0,004 Masseprozent Blei<br />
        Cd = Batterie enthält mehr als 0,002 Masseprozent Cadmium<br />
        Hg = Batterie enthält mehr als 0,0005 Masseprozent Quecksilber.
      </Typography>
    </>
  );

  return <LegalPage title="Batteriegesetzhinweise" content={content} />;
};

export default Batteriegesetzhinweise; 