import Commitment from './Commitment';
import Create from './Create';
import './predictions.css';

const Predictions = ({ commitment }) => (commitment ? <Commitment commitment={commitment} /> : <Create />);

export default Predictions;
