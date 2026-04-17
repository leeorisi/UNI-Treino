import uniforLogo from '../assets/logounifor.png';

function Logo({ size = 32 }) {
  return (
    <div className="unitreino-logo" aria-label="UNI Treino">
      
      {}
      <img 
        src={uniforLogo} 
        alt="Logo Unifor" 
        width={size} 
        height={size} 
        className="unifor-img"
      />

      <span className="logo-text">
        <span className="logo-uni">UNI</span>
        <span className="logo-treino"> Treino</span>
      </span>
    </div>
  );
}

export default Logo;