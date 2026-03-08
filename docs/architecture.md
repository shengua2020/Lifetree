# Life Tree Architecture

## Overview

Life Tree is a minimal web application where users record one short sentence per day.
Each record becomes a leaf on a tree.

One tree grows for 365 days.

After 365 days a new tree begins.

The interface must be calm, simple and natural.

Design philosophy follows Apple minimal design principles.


## Core Concepts

Seed
The first interaction. The user discovers the seed and clicks it to begin.

Leaf
Each day one sentence becomes a leaf.

Tree
365 leaves form one tree.

Forest
Multiple years form a forest.


## Core Rules

• Records cannot be deleted
• Records cannot be edited
• The first leaf never falls
• Tree growth follows natural time
• No notifications
• No gamification


## Technology

Frontend
Next.js

Graphics
SVG tree rendering

Animation
CSS + minimal JS animation

Backend
Simple API

Database
PostgreSQL


## Data Structure

User

user_id
created_at
location

Tree

tree_id
user_id
start_date

Leaf

leaf_id
tree_id
date
text
photo_url


## Visual Design

Style

Apple minimal style

Natural colors

Calm animations

Quiet interaction
