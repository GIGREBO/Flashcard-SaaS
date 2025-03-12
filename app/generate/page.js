"use client";
import { useState } from 'react'
import { Box, Typography, Grid, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions } from '@mui/material'
import { doc, collection, getDoc, writeBatch } from 'firebase/firestore'
import { db } from '/firebase' // Ensure you have Firebase initialized

export default function Generate({ user }) {
  const [text, setText] = useState('') // To store the input text
  const [flashcards, setFlashcards] = useState([]) // To store the generated flashcards
  const [setName, setSetName] = useState('') // For flashcard set name
  const [dialogOpen, setDialogOpen] = useState(false) // For dialog open/close state

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Please enter some text to generate flashcards.')
      return
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: text, // Send the user input to the API
      })

      if (!response.ok) {
        throw new Error('Failed to generate flashcards')
      }

      const data = await response.json()
      setFlashcards(data) // Update flashcards state with generated flashcards
    } catch (error) {
      console.error('Error generating flashcards:', error)
      alert('An error occurred while generating flashcards. Please try again.')
    }
  }

  const handleOpenDialog = () => setDialogOpen(true)
  const handleCloseDialog = () => setDialogOpen(false)

  const saveFlashcards = async () => {
    if (!setName.trim()) {
      alert('Please enter a name for your flashcard set.')
      return
    }

    try {
      const userDocRef = doc(collection(db, 'users'), user.id)
      const userDocSnap = await getDoc(userDocRef)

      const batch = writeBatch(db)

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data()
        const updatedSets = [...(userData.flashcardSets || []), { name: setName }]
        batch.update(userDocRef, { flashcardSets: updatedSets })
      } else {
        batch.set(userDocRef, { flashcardSets: [{ name: setName }] })
      }

      const setDocRef = doc(collection(userDocRef, 'flashcardSets'), setName)
      batch.set(setDocRef, { flashcards })

      await batch.commit()

      alert('Flashcards saved successfully!')
      handleCloseDialog()
      setSetName('') // Reset set name after saving
    } catch (error) {
      console.error('Error saving flashcards:', error)
      alert('An error occurred while saving flashcards. Please try again.')
    }
  }

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Generate Flashcards
      </Typography>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text here"
        rows="10"
        cols="50"
      />
      <br />
      <button onClick={handleSubmit}>Generate Flashcards</button>

      {/* Display flashcards */}
      {flashcards.length > 0 && (
        <>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Generated Flashcards
            </Typography>
            <Grid container spacing={2}>
              {flashcards.map((flashcard, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">Front:</Typography>
                      <Typography>{flashcard.front}</Typography>
                      <Typography variant="h6" sx={{ mt: 2 }}>Back:</Typography>
                      <Typography>{flashcard.back}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Save Flashcards Button */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" color="primary" onClick={handleOpenDialog}>
              Save Flashcards
            </Button>
          </Box>
        </>
      )}

      {/* Save Flashcard Set Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Save Flashcard Set</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a name for your flashcard set.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Set Name"
            type="text"
            fullWidth
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={saveFlashcards} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
