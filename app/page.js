
"use client";

import { AppBar, Toolbar, Typography, Button, Box, Grid } from '@mui/material'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import getStripe from '../utils/get-stripe'

import React from 'react'

export default function Home() {
  // Function to handle Stripe checkout for the Pro plan
  const handleSubmit = async () => {
    try {
      const checkoutSession = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!checkoutSession.ok) {
        throw new Error('Failed to create checkout session')
      }
      
      const checkoutSessionJson = await checkoutSession.json()
  
      if (!checkoutSessionJson.id) {
        throw new Error('Invalid checkout session response')
      }
  
      const stripe = await getStripe()
      const { error } = await stripe.redirectToCheckout({
        sessionId: checkoutSessionJson.id,
      })
  
      if (error) {
        console.error('Stripe redirect error:', error.message)
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      // Show error message to user
    }
  }

  return (
    <>
      {/* Header and Navigation */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Flashcard SaaS
          </Typography>
          <SignedOut>
            <Button color="inherit" href="/sign-in">
              Login
            </Button>
            <Button color="inherit" href="/sign-up">
              Sign Up
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Flashcard SaaS
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          The easiest way to create flashcards from your text.
        </Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2, mr: 2 }} href="/generate">
          Get Started
        </Button>
        <Button variant="outlined" color="primary" sx={{ mt: 2 }}>
          Learn More
        </Button>
      </Box>

      {/* Features Section */}
      <Box sx={{ my: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom>
              Create Flashcards
            </Typography>
            <Typography variant="body1">
              Easily create flashcards from any text input. Perfect for studying or teaching.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom>
              Save and Organize
            </Typography>
            <Typography variant="body1">
              Organize your flashcards into sets and save them to your account for easy access.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom>
              Study Efficiently
            </Typography>
            <Typography variant="body1">
              Use our interactive flashcards to study more efficiently and track your progress.
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ my: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Pricing
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom>
              Free Plan
            </Typography>
            <Typography variant="body1">
              Access basic features for free, including flashcard creation and study tools.
            </Typography>
            <Button variant="outlined" color="primary" sx={{ mt: 2 }}>
              Sign Up for Free
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom>
              Pro Plan - $10/month
            </Typography>
            <Typography variant="body1">
              Unlock advanced features, including unlimited flashcard sets, and priority support.
            </Typography>
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSubmit}>
              Go Pro
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}
