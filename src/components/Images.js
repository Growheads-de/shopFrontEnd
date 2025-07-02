import React, { Component } from 'react';
import Box from '@mui/material/Box';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import CloseIcon from '@mui/icons-material/Close';
import LoupeIcon from '@mui/icons-material/Loupe';

class Images extends Component {
  constructor(props) {
    super(props);
    this.state = { mainPic:0,pics:[]};

    console.log('Images constructor',props);
  }

  componentDidMount  () {
    this.updatePics(0);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.fullscreenOpen !== this.props.fullscreenOpen) {
      this.updatePics();
    }
  }

  updatePics = (newMainPic = this.state.mainPic) => {
    if (!window.tinyPicCache) window.tinyPicCache = {}; 
    if (!window.smallPicCache) window.smallPicCache = {};
    if (!window.mediumPicCache) window.mediumPicCache = {};
    if (!window.largePicCache) window.largePicCache = {};

    if(this.props.pictureList && this.props.pictureList.length > 0){
      const bildIds = this.props.pictureList.split(',');
     

      const pics = [];
      const mainPicId = bildIds[newMainPic];

      for(const bildId of bildIds){
        if(bildId == mainPicId){
        
          if(window.largePicCache[bildId]){
            pics.push(window.largePicCache[bildId]);  
          }else if(window.mediumPicCache[bildId]){
            pics.push(window.mediumPicCache[bildId]);
            if(this.props.fullscreenOpen) this.loadPic('large',bildId,newMainPic);
          }else if(window.smallPicCache[bildId]){
            pics.push(window.smallPicCache[bildId]);
            this.loadPic(this.props.fullscreenOpen ? 'large' : 'medium',bildId,newMainPic);
          }else if(window.tinyPicCache[bildId]){
            pics.push(bildId);
            this.loadPic(this.props.fullscreenOpen ? 'large' : 'medium',bildId,newMainPic);
          }else{
            pics.push(bildId);
            this.loadPic(this.props.fullscreenOpen ? 'large' : 'medium',bildId,newMainPic);
          }  
        }else{
          if(window.tinyPicCache[bildId]){
            pics.push(window.tinyPicCache[bildId]);
          }else if(window.mediumPicCache[bildId]){
            pics.push(window.mediumPicCache[bildId]);
            this.loadPic('tiny',bildId,newMainPic);
          }else{
            pics.push(null);
            this.loadPic('tiny',bildId,pics.length-1);
          }
        }
      }
      console.log('pics',pics);
      this.setState({ pics, mainPic: newMainPic });
    }else{
      if(this.state.pics.length > 0) this.setState({ pics:[], mainPic: newMainPic });
    }
  }

  loadPic = (size,bildId,index) => {
    this.props.socket.emit('getPic', { bildId, size }, (res) => {
      if(res.success){
        const url = URL.createObjectURL(new Blob([res.imageBuffer], { type: 'image/jpeg' }));

        if(size === 'medium') window.mediumPicCache[bildId] = url;
        if(size === 'small') window.smallPicCache[bildId] = url;
        if(size === 'tiny') window.tinyPicCache[bildId] = url;
        if(size === 'large') window.largePicCache[bildId] = url;
        const pics = this.state.pics;
        pics[index] = url
        this.setState({ pics });
      }
    })
  }

  handleThumbnailClick = (clickedPic) => {
    // Find the original index of the clicked picture in the full pics array
    const originalIndex = this.state.pics.findIndex(pic => pic === clickedPic);
    if (originalIndex !== -1) {
      this.updatePics(originalIndex);
    }
  }

  render() {
    return (
      <>
        {this.state.pics[this.state.mainPic] && (
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <CardMedia 
              component="img" 
              height="400" 
              sx={{ 
                objectFit: 'contain',
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)'
                }
              }} 
              image={this.state.pics[this.state.mainPic]}
              onClick={this.props.onOpenFullscreen}
            />
            <IconButton
              size="small"
              disableRipple
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                pointerEvents: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.6)'
                }
              }}
            >
              <LoupeIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-start', mt: 1,mb: 1 }}>
        {this.state.pics.filter(pic => pic !== null && pic !== this.state.pics[this.state.mainPic]).map((pic, filterIndex) => {
          // Find the original index in the full pics array
          const originalIndex = this.state.pics.findIndex(p => p === pic);
          return (
            <Box key={filterIndex} sx={{ position: 'relative' }}>
              <Badge
                badgeContent={originalIndex + 1}
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: 'rgba(119, 155, 191, 0.79)',
                    color: 'white',
                    fontSize: '0.7rem',
                    minWidth: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    top: 4,
                    right: 4,
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    fontWeight: 'bold',
                    opacity: 0,
                    transition: 'opacity 0.2s ease-in-out'
                  },
                  '&:hover .MuiBadge-badge': {
                    opacity: 1
                  }
                }}
              >
                <CardMedia 
                  component="img" 
                  height="80" 
                  sx={{ 
                    objectFit: 'contain',
                    cursor: 'pointer',
                    borderRadius: 1,
                    border: '2px solid transparent',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      border: '2px solid #1976d2',
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }
                  }} 
                  image={pic}
                  onClick={() => this.handleThumbnailClick(pic)}
                />
              </Badge>
            </Box>
          );
        })}
        </Stack>

        {/* Fullscreen Dialog */}
        <Dialog
          open={this.props.fullscreenOpen || false}
          onClose={this.props.onCloseFullscreen}
          maxWidth={false}
          fullScreen
          sx={{
            '& .MuiDialog-paper': {
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            }
          }}
        >
          <DialogContent 
            sx={{ 
              p: 0, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              height: '100vh',
              cursor: 'pointer'
            }}
            onClick={(e) => {
              // Only close if clicking on the background (DialogContent itself)
              if (e.target === e.currentTarget) {
                this.props.onCloseFullscreen();
              }
            }}
          >
            {/* Close Button */}
            <IconButton
              onClick={this.props.onCloseFullscreen}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Main Image in Fullscreen */}
            {this.state.pics[this.state.mainPic] && (
                              <CardMedia 
                  component="img" 
                  sx={{                               
                    objectFit: 'contain',
                    width: '90vw',
                    height: '80vh'
                  }} 
                  image={this.state.pics[this.state.mainPic]}
                  onClick={this.props.onCloseFullscreen}
                />
            )}

            {/* Thumbnail Stack in Fullscreen */}
            <Box 
              sx={{ 
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                maxWidth: '90%',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', p: 3 }}>
                {this.state.pics.filter(pic => pic !== null && pic !== this.state.pics[this.state.mainPic]).map((pic, filterIndex) => {
                  // Find the original index in the full pics array
                  const originalIndex = this.state.pics.findIndex(p => p === pic);
                  return (
                    <Box key={filterIndex} sx={{ position: 'relative' }}>
                                             <Badge
                         badgeContent={originalIndex + 1}
                         sx={{
                           '& .MuiBadge-badge': {
                             backgroundColor: 'rgba(119, 155, 191, 0.79)',
                             color: 'white',
                             fontSize: '0.7rem',
                             minWidth: '20px',
                             height: '20px',
                             borderRadius: '50%',
                             top: 4,
                             right: 4,
                             border: '2px solid rgba(255, 255, 255, 0.8)',
                             fontWeight: 'bold',
                             opacity: 0,
                             transition: 'opacity 0.2s ease-in-out'
                           },
                           '&:hover .MuiBadge-badge': {
                             opacity: 1
                           }
                         }}
                      >
                        <CardMedia 
                          component="img" 
                          height="60" 
                          sx={{ 
                            objectFit: 'contain',
                            cursor: 'pointer',
                            borderRadius: 1,
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              border: '2px solid #1976d2',
                              transform: 'scale(1.1)',
                              boxShadow: '0 4px 8px rgba(25, 118, 210, 0.5)'
                            }
                          }} 
                          image={pic}
                          onClick={() => this.handleThumbnailClick(pic)}
                        />
                      </Badge>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </DialogContent>
        </Dialog>
      </>
    );
  }
}

export default Images; 