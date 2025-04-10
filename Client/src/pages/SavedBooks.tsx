import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';

import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import type { User } from '../models/User';

const SavedBooks = () => {
  const { loading, error: queryError, data, refetch } = useQuery(GET_ME);
  const [removeBook, { error: mutationError}] = useMutation(REMOVE_BOOK);

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      await removeBook({
        variables: { bookId },
      });

      await refetch();
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // if data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  if (queryError || mutationError) {
    return <h2>Error loading user data.</h2>
  }

  const userData: User = data.me || {
    username: '',
    email: '',
    password: '',
    savedBooks: [],
    bookCount: 0,
  }

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
 
        Copy code
<Row>
  {userData.savedBooks.map((book) => {
    return (
      <Col key={book.bookId} md='4'> {/* Moved key here */}
        <Card border='dark'>
          {book.image ? (
            <Card.Img
              src={book.image}
              alt={`The cover for ${book.title}`}
              variant='top'
            />
          ) : null}
          <Card.Body>
            <Card.Title>{book.title}</Card.Title>
            <p className='small'>Authors: {book.authors}</p>
            <Card.Text>{book.description}</Card.Text>
            <Button
              className='btn-block btn-danger'
              onClick={() => handleDeleteBook(book.bookId)}
            >
              Delete this Book!
            </Button>
          </Card.Body>
        </Card>
      </Col>
    );
  })}
</Row>
      </Container>
    </>
  );
};

export default SavedBooks;