"use client";
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import { Container, Grid, Card, CardActionArea, CardContent, Typography, Box } from '@mui/material'
import { collection, doc, getDocs } from 'firebase/firestore'
import { db } from '../firebase' // Ensure Firebase is initialized

export default function Flashcard() {
  const { isLoaded, isSignedIn, user } = useUser() // Clerk authentication hook
  const [flashcards, setFlashcards] = useState([]) // Flashcard state
  const [flipped, setFlipped] = useState({}) // Flip state for each flashcard

  const searchParams = useSearchParams()
  const search = searchParams.get('id') // Get flashcard set ID from URL

  useEffect(() => {
    async function getFlashcard() {
      if (!search || !user) return

      try {
        const colRef = collection(doc(collection(db, 'users'), user.id), 'flashcardSets', search, 'flashcards')
        const docs = await getDocs(colRef)
        const flashcards = []
        docs.forEach((doc) => {
          flashcards.push({ id: doc.id, ...doc.data() })
        })
        setFlashcards(flashcards) // Set the flashcards data
      } catch (error) {
        console.error('Error fetching flashcards:', error)
      }
    }
    getFlashcard()
  }, [search, user])

  const handleCardClick = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the flip state of the card
    }))
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        {search} Flashcard Set
      </Typography>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        {flashcards.map((flashcard) => (
          <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
            <Card>
              <CardActionArea onClick={() => handleCardClick(flashcard.id)}>
                <CardContent>
                  <Box
                    sx={{
                      perspective: '1000px',
                      position: 'relative',
                      height: '200px',
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        transition: 'transform 0.6s',
                        transformStyle: 'preserve-3d',
                        transform: flipped[flashcard.id] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      }}
                    >
                      {/* Front side of the card */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          backfaceVisibility: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h5" component="div">
                          {flashcard.front}
                        </Typography>
                      </Box>
                      {/* Back side of the card */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h5" component="div">
                          {flashcard.back}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
