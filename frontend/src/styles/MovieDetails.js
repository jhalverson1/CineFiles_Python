export const styles = {
  background: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    overflowY: 'auto',
  },
  container: {
    position: 'relative',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    color: 'white',
    zIndex: 1,
  },
  header: {
    display: 'flex',
    gap: '30px',
    marginBottom: '40px',
  },
  poster: {
    width: '300px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  headerInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '2.5em',
    marginBottom: '10px',
    color: 'white',
  },
  year: {
    color: '#ccc',
    fontWeight: 'normal',
  },
  director: {
    fontSize: '1.2em',
    color: '#ccc',
    marginBottom: '15px',
  },
  metadata: {
    color: '#ccc',
    fontSize: '1.1em',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '1.8em',
    marginBottom: '20px',
    borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '10px',
    color: 'white',
  },
  overview: {
    marginTop: '20px',
  },
  overviewTitle: {
    fontSize: '1.4em',
    marginBottom: '10px',
    color: 'white',
  },
  overviewText: {
    fontSize: '1.1em',
    lineHeight: '1.6',
    color: '#fff',
    marginBottom: '20px',
  },
  castContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  castGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '10px',
    marginBottom: '20px',
    maxHeight: '160px',
    overflow: 'hidden',
    transition: 'max-height 0.5s ease-in-out',
  },
  castMember: {
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  castImage: {
    width: '80px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '4px',
  },
  placeholderImage: {
    width: '80px',
    height: '120px',
    backgroundColor: '#eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    marginBottom: '4px',
  },
  actorName: {
    fontWeight: 'bold',
    marginBottom: '2px',
    fontSize: '0.75em',
  },
  characterName: {
    color: '#ccc',
    fontSize: '0.65em',
  },
  expandTrigger: {
    cursor: 'pointer',
    textAlign: 'center',
    padding: '15px',
    color: '#e50914',
    background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.9) 20%)',
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    '&:hover': {
      color: '#ff0a16',
    },
  },
  arrow: {
    fontSize: '12px',
    marginTop: '5px',
    transition: 'transform 0.3s ease',
  },
  trailerButton: {
    marginTop: '15px',
    padding: '6px 12px',
    fontSize: '0.9em',
    backgroundColor: '#e50914',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    width: 'fit-content',
  },
}; 