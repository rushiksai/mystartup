# Overview

This is a full-stack ATS (Applicant Tracking System) Resume Analyzer application built with React, Express, and TypeScript. The application allows users to upload their resume files (PDF, DOC, DOCX) and analyze them against specific job descriptions to get comprehensive feedback on ATS compatibility, keyword matching, and improvement recommendations. The system uses OpenAI's GPT-4 model to provide intelligent analysis of resume content and generates detailed scoring metrics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for build tooling
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **File Handling**: HTML5 File API with drag-and-drop support for resume uploads

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **File Processing**: 
  - PDF text extraction using pdf-parse library
  - Word document processing with mammoth.js
  - Multer middleware for multipart file uploads with 5MB size limits
- **AI Integration**: OpenAI GPT-4 API for intelligent resume analysis
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **API Design**: RESTful endpoints with proper error handling and request logging middleware

## Data Storage Solutions
- **Current Implementation**: In-memory storage using Map data structure
- **Database Schema**: Drizzle ORM with PostgreSQL schema definitions ready for production deployment
- **Data Models**: Comprehensive analysis results including ATS scores, keyword matching, skills analysis, and recommendations

## Authentication and Authorization
- **Current State**: No authentication implemented (single-user application)
- **Session Management**: Express sessions configured but not actively used
- **Future Considerations**: Ready for authentication integration with session-based approach

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver for Neon serverless database
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **drizzle-kit**: Database migration and schema management tools

### File Processing
- **pdf-parse**: PDF text extraction library
- **mammoth**: Microsoft Word document processing
- **multer**: Express middleware for handling multipart/form-data file uploads

### AI and Analysis
- **OpenAI API**: GPT-4 model integration for intelligent resume analysis
- **Natural language processing**: Built-in analysis for keyword extraction and matching

### UI and Frontend
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **@tanstack/react-query**: Server state management and data fetching
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing library
- **react-hook-form**: Performant forms library with minimal re-renders

### Development and Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Static type checking and enhanced developer experience
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-runtime-error-modal**: Development error handling