import React from 'react';
import './App.css';

import { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMedal } from '@fortawesome/free-solid-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Flipper, Flipped } from 'react-flip-toolkit';

function App() {
  const initialTeams = [
    { Equipe: 'Arcanjo Miguel', Gold: 0, Silver: 0, Bronze: 0 },
    { Equipe: 'Black Dragon', Gold: 0, Silver: 0, Bronze: 0 },
    { Equipe: 'Bushin', Gold: 0, Silver: 0, Bronze: 0 },
    { Equipe: 'Clube de Arte Luta', Gold: 0, Silver: 0, Bronze: 0 },
    { Equipe: 'Cobra Hapkido', Gold: 0, Silver: 0, Bronze: 0 },
    { Equipe: 'Dragoes de Hapkido', Gold: 0, Silver: 0, Bronze: 0 },
    { Equipe: 'Fenix', Gold: 0, Silver: 0, Bronze: 0 },
    { Equipe: 'Hapkido Botto', Gold: 0, Silver: 0, Bronze: 0 },
    { Equipe: 'In Fight Hapkido', Gold: 0, Silver: 0, Bronze: 0 },
    { Equipe: 'Livre Treino', Gold: 0, Silver: 0, Bronze: 0 },
    { Equipe: 'Phantera', Gold: 0, Silver: 0, Bronze: 0 },
    { Equipe: 'Tigre Branco', Gold: 0, Silver: 0, Bronze: 0 },
  ];

  const [data, setData] = useState(initialTeams);
  const [podiumData, setPodiumData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [competitorData, setCompetitorData] = useState([]);
  const [competitorsCount, setCompetitorsCount] = useState(3)

  function score(team) {
    return (
      parseInt(team.Gold) * 3 +
      parseInt(team.Silver) * 2 +
      parseInt(team.Bronze)
    );
  }

  const calculateTeamMedals = (competitors, teams) => {
    const medalCounts = competitors.reduce((acc, competitor) => {
      const { Equipe, Medalha } = competitor;

      if (!acc[Equipe]) {
        acc[Equipe] = { Gold: 0, Silver: 0, Bronze: 0 };
      }

      if (Medalha === 'Ouro') acc[Equipe].Gold += 1;
      else if (Medalha === 'Prata') acc[Equipe].Silver += 1;
      else if (Medalha === 'Bronze') acc[Equipe].Bronze += 1;

      return acc;
    }, {});

    const teamsMedals = teams.map((team) => ({
      ...team,
      ...medalCounts[team.Equipe],
    }));

    teamsMedals.forEach((team) => {
      team['score'] = score(team);
    });

    return teamsMedals.sort((a, b) => b.score - a.score);
  };

  const calculateCompetitorScores = (competitors) => {
    const scores = competitors.reduce(
      (acc, { Atleta, Medalha, Equipe, Faixa }) => {
        const key = `${Atleta}-${Equipe}`;

        if (!acc[key]) {
          acc[key] = { Atleta, Equipe, Faixa, Gold: 0, Silver: 0, Bronze: 0 };
        }

        if (Medalha === 'Ouro') acc[key].Gold += 1;
        else if (Medalha === 'Prata') acc[key].Silver += 1;
        else if (Medalha === 'Bronze') acc[key].Bronze += 1;

        return acc;
      },
      {}
    );

    const sortedScores = Object.values(scores).map((competitor) => ({
      ...competitor,
      TotalPoints:
        competitor.Gold * 3 + competitor.Silver * 2 + competitor.Bronze,
      Faixa: competitor.Faixa,
    }));

    return sortedScores
      .sort((a, b) => b.TotalPoints - a.TotalPoints)
      .slice(0, competitorsCount);
  };

  let baseUrl = 'https://sheetdb.io/api/v1/7i662u4l7a3w5';

  const fetchPodium = async () => {
    const url = baseUrl;

    setIsLoading(true);
    try {
      const response = await axios.get(url);
      const lastSix = response.data.slice(-6).reverse();
      setPodiumData(lastSix);

      const updatedData = calculateTeamMedals(response.data, data);
      const competitorScores = calculateCompetitorScores(response.data);

      setCompetitorData(competitorScores);
      setData(updatedData);
    } catch (error) {
      if (error.message === 'Request failed with status code 429') {
        baseUrl = 'https://sheetdb.io/api/v1/903hywz10drfe';
        fetchPodium();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPodium();
  }, []);

  return (
    <div className="container">
      <div className="content">
        <div>
          <div>
            <h1 className="text-center my-4">Campeonato Baiano - Desafio de Luta Coreana</h1>
            <Flipper flipKey={data.map((item) => item.Equipe).join()}>
              <table className="table1 table-hover">
                <thead>
                  <tr>
                    <th>Equipe</th>
                    <th>Ouro</th>
                    <th>Prata</th>
                    <th>Bronze</th>
                    <th>Pontuação Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <Flipped key={item.Equipe} flipId={item.Equipe}>
                      <tr>
                        <td>{`${index + 1}º ${item.Equipe}`}</td>
                        <td>
                          <FontAwesomeIcon
                            icon={faMedal}
                            className="text-warning"
                          />{' '}
                          {item.Gold}
                        </td>
                        <td>
                          <FontAwesomeIcon
                            icon={faMedal}
                            className="text-secondary"
                          />{' '}
                          {item.Silver}
                        </td>
                        <td>
                          <FontAwesomeIcon icon={faMedal} className="bronze" />{' '}
                          {item.Bronze}
                        </td>
                        <td>{item.score}</td>
                      </tr>
                    </Flipped>
                  ))}
                </tbody>
              </table>
            </Flipper>

            <div className="d-flex justify-content-center align-items-center mb-3">
              {isLoading ? (
                <div className="text-center mt-3">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    size="4x"
                    style={{ color: 'white' }}
                  />
                </div>
              ) : (
                <div className="d-flex flex-column align-items-center" >
                  <button onClick={fetchPodium} className="btn btn-warning mt-3 fs-4">
                    Atualizar
                  </button>
                  <input
                    type="number"
                    id="competitorsCount"
                    className="form-control mt-3"
                    value={competitorsCount}
                    onChange={(e) => setCompetitorsCount(parseInt(e.target.value))}
                    min="1"
                  />
              </div>
                
              )}
           </div>

            <div>
              <h3 className="text-center my-4">Melhores Atletas</h3>
              <Flipper
                flipKey={competitorData
                  .map((item) => item.Atleta + item.Equipe)
                  .join()}
              >
                <table className="table1 table-hover">
                  <thead>
                    <tr>
                      <th>Atleta</th>
                      <th>Equipe</th>
                      <th>Faixa</th>
                      <th>Ouro</th>
                      <th>Prata</th>
                      <th>Bronze</th>
                      <th>Pontuação Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitorData.map(
                      (
                        {
                          Atleta,
                          Equipe,
                          Gold,
                          Silver,
                          Bronze,
                          TotalPoints,
                          Faixa,
                        },
                        index
                      ) => (
                        <Flipped
                          key={`${Atleta}-${Equipe}`}
                          flipId={`${Atleta}-${Equipe}`}
                        >
                          <tr>
                            <td>{`${index + 1}º ${Atleta}`}</td>
                            <td>{Equipe}</td>
                            <td>{Faixa}</td>
                            <td>
                              <FontAwesomeIcon
                                icon={faMedal}
                                className="text-warning"
                              />{' '}
                              {Gold}
                            </td>
                            <td>
                              <FontAwesomeIcon
                                icon={faMedal}
                                className="text-secondary"
                              />{' '}
                              {Silver}
                            </td>
                            <td>
                              <FontAwesomeIcon
                                icon={faMedal}
                                className="bronze"
                              />{' '}
                              {Bronze}
                            </td>
                            <td>{TotalPoints}</td>
                          </tr>
                        </Flipped>
                      )
                    )}
                  </tbody>
                </table>
              </Flipper>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
