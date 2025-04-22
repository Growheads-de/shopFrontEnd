import React from 'react';
import { Typography } from '@mui/material';
import LegalPage from './LegalPage.js';

const Batteriegesetzhinweise = () => {
  const content = (
    <>
      <Typography variant="body1" paragraph>
        Als Verkäufer sind wir gemäß dem Batteriegesetz (BattG) verpflichtet, Sie auf Folgendes hinzuweisen:
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Hinweis zur Batterie-Entsorgung
      </Typography>
      <Typography variant="body1" paragraph>
        Altbatterien dürfen nicht in den Hausmüll gegeben werden. Verbraucher sind gesetzlich verpflichtet, Batterien zu einer geeigneten Sammelstelle zu bringen. Sie können Batterien dort unentgeltlich abgeben.
      </Typography>
      
      <Typography variant="body1" paragraph>
        Batterien enthalten gesundheits- und umweltschädliche Stoffe. Die chemischen Symbole der gesundheits- und umweltschädlichen Stoffe bedeuten:
      </Typography>
      
      <Typography variant="body1" sx={{ ml: 2 }} paragraph>
        • Cd (Cadmium)<br />
        • Pb (Blei)<br />
        • Hg (Quecksilber)<br />
      </Typography>
      
      <Typography variant="body1" paragraph>
        Das Symbol der durchgekreuzten Mülltonne bedeutet, dass die Batterie nicht in den Hausmüll gegeben werden darf.
      </Typography>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Rückgabemöglichkeiten
      </Typography>
      <Typography variant="body1" paragraph>
        Sie können Batterien nach Gebrauch an der Verkaufsstelle oder in deren unmittelbarer Nähe unentgeltlich zurückgeben. Falls Sie Batterien online bei uns bestellt haben, können Sie diese auch per Post zurücksenden. Wir übernehmen die anfallenden Portokosten. Bitte senden Sie die Batterien an:
      </Typography>
      
      <Typography variant="body1" sx={{ ml: 2 }} paragraph>
        [Firmenname]<br />
        [Straße und Hausnummer]<br />
        [PLZ und Ort]<br />
        Stichwort "Batterieentsorgung"
      </Typography>
    </>
  );

  return <LegalPage title="Batteriegesetzhinweise" content={content} />;
};

export default Batteriegesetzhinweise; 