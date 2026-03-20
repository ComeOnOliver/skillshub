# PyTorch

## Overview

PyTorch is a deep learning framework for building and training neural networks with dynamic computation graphs and automatic differentiation. It provides tensor operations with GPU acceleration, `nn.Module` for defining architectures, DataLoader for efficient data loading, mixed precision training for performance, and export tools (TorchScript, ONNX) for production deployment.

## Instructions

- When defining models, subclass `nn.Module` with `__init__` for layers and `forward` for computation, using `nn.Sequential` for simple stacks and custom forward logic for complex architectures.
- When training, implement the standard loop: forward pass, loss computation, `loss.backward()`, `optimizer.step()`, `optimizer.zero_grad()`, with gradient clipping via `clip_grad_norm_` for stability.
- When loading data, subclass `Dataset` with `__len__` and `__getitem__`, then use `DataLoader` with `num_workers=4` and `pin_memory=True` for GPU training throughput.
- When optimizing performance, use `torch.compile(model)` on PyTorch 2.0+ for 20-50% speedup, mixed precision with `torch.amp.autocast()` for halved memory and doubled throughput, and `DistributedDataParallel` for multi-GPU training.
- When doing transfer learning, load pretrained models from `torchvision.models` or Hugging Face, freeze the backbone, and replace the classifier head for your task.
- When deploying, use `torch.export()` or `torch.jit.trace()` for production, `torch.onnx.export()` for cross-framework compatibility, and `torch.quantization` for INT8 inference speedup.

## Examples

### Example 1: Fine-tune a vision model for image classification

**User request:** "Fine-tune a pretrained ResNet for classifying product images"

**Actions:**
1. Load `resnet50(weights=ResNet50_Weights.DEFAULT)` and freeze all layers except the final classifier
2. Replace the classifier head with `nn.Linear(2048, num_classes)`
3. Set up DataLoader with image augmentation transforms (RandomCrop, ColorJitter, Normalize)
4. Train with AdamW, CosineAnnealingLR scheduler, and mixed precision

**Output:** A fine-tuned image classifier with production-quality accuracy and efficient mixed-precision training.

### Example 2: Train a text classification model with Hugging Face

**User request:** "Build a sentiment analysis model using a pretrained transformer"

**Actions:**
1. Load `AutoModel.from_pretrained("bert-base-uncased")` with a classification head
2. Tokenize the dataset using `AutoTokenizer` and create a DataLoader
3. Fine-tune with AdamW, linear warmup scheduler, and gradient clipping
4. Export the trained model with `torch.export()` for production serving

**Output:** A sentiment analysis model fine-tuned on custom data and exported for production inference.

## Guidelines

- Use `torch.compile(model)` on PyTorch 2.0+ for a free 20-50% speedup with one line.
- Use `AdamW` over `Adam` for correct weight decay implementation with modern architectures.
- Use mixed precision (`torch.amp`) for any GPU training to halve memory and double throughput.
- Move data to device in the training loop, not in the Dataset, to keep Dataset device-agnostic.
- Use `model.eval()` and `torch.no_grad()` during inference to prevent unnecessary gradient computation.
- Use `pin_memory=True` in DataLoader when training on GPU to speed up CPU-to-GPU data transfer.
- Save `model.state_dict()` not the full model since state dicts are portable across code changes.